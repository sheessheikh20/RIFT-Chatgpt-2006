package com.openai.chat2006.service.impl;

import com.openai.chat2006.exception.KnowledgePackMissingException;
import com.openai.chat2006.model.KnowledgePack;
import com.openai.chat2006.model.Message;
import com.openai.chat2006.repository.KnowledgePackRepository;
import com.openai.chat2006.service.AIService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service("openAIProvider")
public class OpenAIProvider implements AIService {

    private final KnowledgePackRepository knowledgePackRepository;
    private final AIService mockProvider;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String modelName;

    public OpenAIProvider(
            KnowledgePackRepository knowledgePackRepository,
            @Qualifier("mockProvider") AIService mockProvider,
            ObjectMapper objectMapper
    ) {
        this.knowledgePackRepository = knowledgePackRepository;
        this.mockProvider = mockProvider;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    @Override
    public String generateResponse(String prompt, String profile, List<Message> history) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            // Fallback to Mock Provider when no key is specified
            return mockProvider.generateResponse(prompt, profile, history);
        }

        try {
            List<KnowledgePack> allPacks = knowledgePackRepository.findAll();
            String installedPacks = allPacks.stream()
                    .filter(KnowledgePack::isInstalled)
                    .map(KnowledgePack::getId)
                    .collect(Collectors.joining(", "));
            String missingPacks = allPacks.stream()
                    .filter(p -> !p.isInstalled())
                    .map(KnowledgePack::getId)
                    .collect(Collectors.joining(", "));

            String systemPrompt = String.format(
                    "You are the AI engine of the 'ChatGPT Professional Enterprise Suite' released in 2006.\n" +
                    "Currently, you are running in the context of the user profile: '%s'. You must adopt this persona:\n" +
                    "- Teacher: Explain concepts simply, politely, and add 'Remember to do your homework!' or grades like 'Grade: A+'.\n" +
                    "- Scientist: Use dense scientific jargon, observations, formal syntax.\n" +
                    "- Business Consultant: Talk about synergy, ROI, deliverables, bullet points.\n" +
                    "- Creative Writer: Use metaphors, poetic sentences, and high drama.\n" +
                    "- Programmer: Write clean code, add standard source comments.\n" +
                    "- Historian: Frame things chronologically with dates, historical quotes.\n\n" +
                    "CRITICAL: The following knowledge packages are INSTALLED: [%s].\n" +
                    "The following knowledge packages are NOT INSTALLED/MISSING: [%s].\n" +
                    "The packs correspond to these domains:\n" +
                    "- medicine: clinical terms, disease diagnostics, cancer, pharmacology\n" +
                    "- finance: stock trading, investments, tax law, financial planning\n" +
                    "- astronomy: planets, stars, black holes, space telescopes\n" +
                    "- engineering: suspension bridge mechanics, structural safety factors, engine thermodynamic equations\n" +
                    "- legal: courtroom actions, contract litigation, intellectual property rights\n" +
                    "If the user's prompt requires knowledge from a MISSING pack, you MUST reply exactly with this text and nothing else: " +
                    "'[KNOWLEDGE_PACK_MISSING: <packId>]' (replace <packId> with the missing pack ID from the list, e.g. '[KNOWLEDGE_PACK_MISSING: astronomy]').\n" +
                    "Otherwise, reply normally under your profile persona, keeping references and facts vintage up to 2006.",
                    profile != null ? profile : "Default",
                    installedPacks,
                    missingPacks
            );

            // Construct payload
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));

            // Include history (limit to last 10 messages for token efficiency)
            int startIdx = Math.max(0, history.size() - 10);
            for (int i = startIdx; i < history.size(); i++) {
                Message msg = history.get(i);
                messages.add(Map.of(
                        "role", "user".equals(msg.getRole()) ? "user" : "assistant",
                        "content", msg.getContent()
                ));
            }

            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    entity,
                    String.class
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(responseEntity.getBody());
                String aiReply = root.path("choices").get(0).path("message").path("content").asText();

                if (aiReply.startsWith("[KNOWLEDGE_PACK_MISSING:")) {
                    String packId = aiReply.substring(aiReply.indexOf(":") + 1, aiReply.indexOf("]")).trim();
                    KnowledgePack missingPack = knowledgePackRepository.findById(packId).orElse(null);
                    if (missingPack != null) {
                        throw new KnowledgePackMissingException(
                                missingPack.getId(),
                                missingPack.getName(),
                                missingPack.getSizeMb(),
                                missingPack.getEstimatedDownloadMinutes()
                        );
                    }
                }
                return aiReply;
            } else {
                return mockProvider.generateResponse(prompt, profile, history);
            }

        } catch (KnowledgePackMissingException e) {
            throw e;
        } catch (Exception e) {
            // Log and fallback on error
            return mockProvider.generateResponse(prompt, profile, history);
        }
    }
}
