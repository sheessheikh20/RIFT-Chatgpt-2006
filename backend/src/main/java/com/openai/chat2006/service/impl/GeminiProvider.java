package com.openai.chat2006.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.openai.chat2006.model.Message;
import com.openai.chat2006.service.AIProvider;
import com.openai.chat2006.service.AssistantProfileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * Gemini AI provider. Handles both topic classification and profiled response generation.
 * System prompts are resolved via AssistantProfileService — either from DB overrides or built-in defaults.
 */
@Slf4j
@Service("geminiProvider")
public class GeminiProvider implements AIProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AssistantProfileService profileService;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;

    public GeminiProvider(ObjectMapper objectMapper, AssistantProfileService profileService) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
        this.profileService = profileService;
    }

    // ─── Topic Classification ─────────────────────────────────────────────────────

    @Override
    public List<String> classifyQuestion(String question) {
        List<String> categories = new ArrayList<>();
        if (isApiKeyMissing()) {
            log.warn("Gemini API key is missing. Falling back to keyword classification.");
            return getFallbackCategories(question);
        }

        try {
            String url = buildUrl();

            String prompt = "You are a topic classification engine. Return ONLY JSON.\n" +
                    "Question: " + question + "\n\n" +
                    "Available categories:\n" +
                    "- programming\n" +
                    "- mathematics\n" +
                    "- astronomy\n" +
                    "- medicine\n" +
                    "- business\n" +
                    "- writing\n" +
                    "- general\n\n" +
                    "Return format:\n" +
                    "{\n" +
                    "  \"categories\": []\n" +
                    "}";

            String responseStr = callGemini(prompt, null);
            JsonNode responseJson = objectMapper.readTree(responseStr);
            JsonNode textNode = responseJson.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text");

            if (!textNode.isMissingNode()) {
                String text = textNode.asText().trim();
                // Strip markdown code fences if present
                if (text.startsWith("```")) {
                    text = text.replaceAll("```[a-z]*\\n?", "").replaceAll("```", "").trim();
                }
                JsonNode parsedJson = objectMapper.readTree(text);
                JsonNode catsNode = parsedJson.path("categories");
                if (catsNode.isArray()) {
                    for (JsonNode cat : catsNode) {
                        categories.add(cat.asText().toLowerCase().trim());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to classify question via Gemini: {}", e.getMessage());
            return getFallbackCategories(question);
        }

        if (categories.isEmpty()) {
            categories.add("general");
        }
        return categories;
    }

    private List<String> getFallbackCategories(String question) {
        List<String> categories = new ArrayList<>();
        String qLower = question.toLowerCase();
        if (qLower.contains("java") || qLower.contains("python") || qLower.contains("code")
                || qLower.contains("programming") || qLower.contains("html") || qLower.contains("algorithm")
                || qLower.contains("sql") || qLower.contains("database") || qLower.contains("function")) {
            categories.add("programming");
        }
        if (qLower.contains("calculate") || qLower.contains("algebra") || qLower.contains("calculus")
                || qLower.contains("math") || qLower.contains("equation") || qLower.contains("formula")) {
            categories.add("mathematics");
        }
        if (qLower.contains("planet") || qLower.contains("star") || qLower.contains("astronomy")
                || qLower.contains("cosmology") || qLower.contains("orbital") || qLower.contains("galaxy")) {
            categories.add("astronomy");
        }
        if (qLower.contains("disease") || qLower.contains("medicine") || qLower.contains("pharmacology")
                || qLower.contains("anatomy") || qLower.contains("diagnosis") || qLower.contains("symptom")) {
            categories.add("medicine");
        }
        if (qLower.contains("business") || qLower.contains("finance") || qLower.contains("economics")
                || qLower.contains("marketing") || qLower.contains("investment") || qLower.contains("revenue")) {
            categories.add("business");
        }
        if (qLower.contains("write") || qLower.contains("essay") || qLower.contains("grammar")
                || qLower.contains("poem") || qLower.contains("story") || qLower.contains("prose")) {
            categories.add("writing");
        }
        if (categories.isEmpty()) {
            categories.add("general");
        }
        return categories;
    }

    // ─── Response Generation ──────────────────────────────────────────────────────

    @Override
    public String generateResponse(String prompt, String profile, List<Message> history, List<String> installedPacks) {
        if (isApiKeyMissing()) {
            return "[OFFLINE] Gemini API key is not configured. " +
                   "Please set GEMINI_API_KEY environment variable and restart the application.";
        }

        try {
            // Resolve profile system prompt from AssistantProfileService
            String systemPrompt = buildSystemPrompt(profile, installedPacks);

            String url = buildUrl();

            ObjectNode root = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstructionObj = root.putObject("systemInstruction");
            ArrayNode siParts = systemInstructionObj.putArray("parts");
            siParts.addObject().put("text", systemPrompt);

            // Conversation history (last 10 messages)
            ArrayNode contents = root.putArray("contents");
            int startIdx = Math.max(0, history.size() - 10);
            for (int i = startIdx; i < history.size(); i++) {
                Message msg = history.get(i);
                ObjectNode contentObj = contents.addObject();
                contentObj.put("role", "user".equals(msg.getRole()) ? "user" : "model");
                ArrayNode partsArray = contentObj.putArray("parts");
                partsArray.addObject().put("text", msg.getContent());
            }

            // Append current prompt if not already the last history entry
            boolean lastIsUser = !history.isEmpty()
                    && "user".equals(history.get(history.size() - 1).getRole())
                    && prompt.equals(history.get(history.size() - 1).getContent());

            if (!lastIsUser) {
                ObjectNode currentContentObj = contents.addObject();
                currentContentObj.put("role", "user");
                ArrayNode partsArray = currentContentObj.putArray("parts");
                partsArray.addObject().put("text", prompt);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(root), headers);

            String responseStr = restTemplate.postForObject(url, entity, String.class);
            JsonNode responseJson = objectMapper.readTree(responseStr);
            JsonNode textNode = responseJson.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text");

            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }

            log.warn("Gemini returned empty content for profile '{}'. Full response: {}", profile, responseStr);
            return "[Error] Empty response received from the Gemini language engine. Please retry.";

        } catch (Exception e) {
            log.error("Failed to generate response via Gemini (profile={}): {}", profile, e.getMessage());
            return "[Error] Connection to knowledge server failed. Detail: " + e.getMessage();
        }
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────────

    private String buildSystemPrompt(String profileId, List<String> installedPacks) {
        String basePrompt = profileService.resolveSystemPrompt(profileId);

        String packContext = installedPacks.isEmpty()
                ? "No optional knowledge packs are installed."
                : "The following optional Knowledge Packs are installed and available: [" + String.join(", ", installedPacks) + "]. " +
                  "NEVER reference knowledge from packs not in this list.";

        return basePrompt + "\n\n" +
               "SYSTEM CONSTRAINTS:\n" +
               "- " + packContext + "\n" +
               "- This is the ChatGPT Professional Enterprise Suite, released in 2006.\n" +
               "- Never mention events, software, or technologies from after 2006.\n" +
               "- Maintain the persona strictly throughout the entire conversation.";
    }

    private String buildUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
    }

    private String callGemini(String prompt, String systemInstruction) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();

        if (systemInstruction != null) {
            ObjectNode sysNode = root.putObject("systemInstruction");
            sysNode.putArray("parts").addObject().put("text", systemInstruction);
        }

        ArrayNode contents = root.putArray("contents");
        ObjectNode contentObj = contents.addObject();
        contentObj.put("role", "user");
        contentObj.putArray("parts").addObject().put("text", prompt);

        ObjectNode generationConfig = root.putObject("generationConfig");
        generationConfig.put("responseMimeType", "application/json");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(root), headers);

        return restTemplate.postForObject(buildUrl(), entity, String.class);
    }

    private boolean isApiKeyMissing() {
        return apiKey == null || apiKey.trim().isEmpty();
    }
}
