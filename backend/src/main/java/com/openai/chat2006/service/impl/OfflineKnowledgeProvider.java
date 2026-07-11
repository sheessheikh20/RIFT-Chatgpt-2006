package com.openai.chat2006.service.impl;

import com.openai.chat2006.exception.KnowledgePackMissingException;
import com.openai.chat2006.model.KnowledgePack;
import com.openai.chat2006.model.Message;
import com.openai.chat2006.repository.KnowledgePackRepository;
import com.openai.chat2006.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("offlineKnowledgeProvider")
@RequiredArgsConstructor
public class OfflineKnowledgeProvider implements AIService {

    private final KnowledgePackRepository knowledgePackRepository;

    @Qualifier("mockProvider")
    private final AIService mockProvider;

    @Override
    public String generateResponse(String prompt, String profile, List<Message> history) {
        String p = prompt.toLowerCase();

        // 1. Check for live web services which are strictly unavailable offline
        if (p.contains("news") || p.contains("weather") || p.contains("current event") || p.contains("today") || p.contains("tomorrow")) {
            return "[OFFLINE KNOWLEDGE MODE ERROR]\n" +
                   "Operation Failed. The requested service (Live Web Sync) requires an active internet connection.\n" +
                   "Please select a dial-up, DSL, or broadband connection in your Connection Properties.";
        }

        // 2. Otherwise delegate to mockProvider which verifies if the appropriate local pack is installed
        try {
            return mockProvider.generateResponse(prompt, profile, history);
        } catch (KnowledgePackMissingException e) {
            // Re-throw so the UI knows this offline package was not installed
            throw e;
        }
    }
}
