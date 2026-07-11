package com.openai.chat2006.service;

import com.openai.chat2006.exception.KnowledgePackMissingException;
import com.openai.chat2006.model.KnowledgePack;
import com.openai.chat2006.model.Message;
import com.openai.chat2006.repository.KnowledgePackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeEngineService {

    @Qualifier("geminiProvider")
    private final AIProvider aiProvider;

    private final KnowledgePackRepository knowledgePackRepository;
    private final LocalDataService localDataService;

    public String processMessage(String prompt, String profile, List<Message> history, String connectionType) {
        localDataService.writeLog("RUNTIME", "Parsing Request... Loading Dictionary...");
        
        // 1. Classify the topic
        localDataService.writeLog("RUNTIME", "Searching Knowledge Packs... Running Classification Engine...");
        List<String> categories = aiProvider.classifyQuestion(prompt);
        localDataService.writeLog("RUNTIME", "Classification complete. Category matches: " + String.join(", ", categories));

        // 2. Determine required Knowledge Packs based on categories
        List<String> requiredPackIds = new ArrayList<>();
        for (String cat : categories) {
            String packId = mapCategoryToPackId(cat);
            if (packId != null && !requiredPackIds.contains(packId)) {
                requiredPackIds.add(packId);
            }
        }

        // 3. Verify installation status
        for (String packId : requiredPackIds) {
            KnowledgePack pack = knowledgePackRepository.findById(packId).orElse(null);
            if (pack != null && !pack.isInstalled()) {
                localDataService.writeLog("RUNTIME", "Access denied: Required Knowledge Pack '" + pack.getId() + "' is missing.");
                throw new KnowledgePackMissingException(pack.getId(), pack.getName(), pack.getSizeMb(), pack.getEstimatedDownloadMinutes());
            }
        }

        // 4. Fetch installed packs list to pass to Gemini (so Gemini only knows about installed packs)
        List<String> installedPacks = knowledgePackRepository.findAll().stream()
                .filter(KnowledgePack::isInstalled)
                .map(KnowledgePack::getId)
                .collect(Collectors.toList());

        localDataService.writeLog("RUNTIME", "Loading Active Knowledge Buffer... Installed Packs: " + String.join(", ", installedPacks));

        // 5. Generate response using Gemini (or MockProvider if offline)
        String response;
        if ("offline".equalsIgnoreCase(connectionType)) {
            localDataService.writeLog("RUNTIME", "Running Offline Language Engine...");
            response = getOfflineResponse(prompt, profile, categories);
        } else {
            localDataService.writeLog("RUNTIME", "Running Gemini Language Engine...");
            response = aiProvider.generateResponse(prompt, profile, history, installedPacks);
        }

        localDataService.writeLog("RUNTIME", "Formatting Response... Response Ready.");
        return response;
    }

    private String mapCategoryToPackId(String category) {
        switch (category.toLowerCase().trim()) {
            case "programming":
                return "programming";
            case "mathematics":
                return "mathematics";
            case "astronomy":
                return "astronomy";
            case "medicine":
                return "medicine";
            case "business":
            case "finance":
                return "finance";
            case "legal":
                return "legal";
            case "engineering":
                return "engineering";
            case "writing":
            case "grammar":
            case "language":
                return "grammar";
            case "history":
            case "humanities":
                return "history";
            default:
                return null; // general
        }
    }

    private String getOfflineResponse(String prompt, String profile, List<String> categories) {
        String catStr = String.join(", ", categories);
        return String.format(
                "[%s Profile - Offline Mode]\n" +
                "You asked: '%s'\n" +
                "Offline Engine verified local Knowledge Packs and processed under domains [%s].\n" +
                "Response: The offline model has limited intelligence, but confirms that local package verification succeeded.",
                profile != null ? profile : "Default",
                prompt,
                catStr
        );
    }
}
