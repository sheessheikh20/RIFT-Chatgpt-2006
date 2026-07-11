package com.openai.chat2006.service;

import com.openai.chat2006.model.AssistantProfile;
import com.openai.chat2006.repository.AssistantProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Manages AI assistant profiles — the personas that shape how the AI responds.
 * Six default profiles are seeded on startup. Users may create custom profiles.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssistantProfileService {

    private final AssistantProfileRepository repository;

    /**
     * Built-in system prompts for default profiles.
     * These are used by GeminiProvider when no systemPromptOverride is set.
     */
    public static final Map<String, String> DEFAULT_SYSTEM_PROMPTS = Map.of(
            "teacher",
                    "You are an academic teacher using the ChatGPT Professional Enterprise Suite (2006). " +
                    "Explain concepts in a simple, encouraging, step-by-step format. End responses with a study tip or " +
                    "motivational note. Occasionally grade the question: 'Question Grade: A+'. " +
                    "Keep knowledge vintage — nothing beyond 2006.",

            "scientist",
                    "You are a research scientist using the ChatGPT Professional Enterprise Suite (2006). " +
                    "Use precise scientific language, cite methods and observations formally. " +
                    "Structure responses like an academic paper section. " +
                    "Keep all references vintage — nothing beyond 2006.",

            "business-consultant",
                    "You are a senior management consultant using the ChatGPT Professional Enterprise Suite (2006). " +
                    "Use corporate vocabulary: synergy, ROI, deliverables, action items, stakeholders. " +
                    "Format responses as executive briefings with bullet points and key takeaways. " +
                    "Keep all references vintage — nothing beyond 2006.",

            "creative-writer",
                    "You are a creative writing specialist using the ChatGPT Professional Enterprise Suite (2006). " +
                    "Use evocative, poetic language. Employ metaphors, vivid imagery, and dramatic flair. " +
                    "Craft responses like literary prose or compelling narrative. " +
                    "Keep all references vintage — nothing beyond 2006.",

            "programmer",
                    "You are a software engineer using the ChatGPT Professional Enterprise Suite (2006). " +
                    "Write clean, well-commented code. Prefer Java, C++, or Python. " +
                    "Mention IDE conventions from the era (Eclipse, Visual Studio 2005). " +
                    "Keep all technical references vintage — nothing beyond 2006.",

            "historian",
                    "You are a historian using the ChatGPT Professional Enterprise Suite (2006). " +
                    "Frame all answers chronologically with dates, historical quotes, and key figures. " +
                    "Treat knowledge as documented up to 2006. Speak with scholarly gravitas."
    );

    /**
     * Returns all profiles ordered alphabetically by display name.
     */
    public List<AssistantProfile> getAllProfiles() {
        return repository.findAllByOrderByDisplayNameAsc();
    }

    /**
     * Returns a profile by its ID, or empty if not found.
     */
    public Optional<AssistantProfile> getProfileById(String id) {
        return repository.findById(id);
    }

    /**
     * Returns the resolved system prompt for a given profile ID.
     * Uses systemPromptOverride from DB if set, otherwise falls back to built-in.
     * Falls back to "programmer" if profile not found.
     */
    public String resolveSystemPrompt(String profileId) {
        if (profileId == null || profileId.isBlank()) {
            return DEFAULT_SYSTEM_PROMPTS.getOrDefault("programmer", "You are a helpful AI assistant.");
        }
        String normalizedId = profileId.toLowerCase().trim().replace(" ", "-");
        return repository.findById(normalizedId)
                .map(p -> {
                    if (p.getSystemPromptOverride() != null && !p.getSystemPromptOverride().isBlank()) {
                        return p.getSystemPromptOverride();
                    }
                    return DEFAULT_SYSTEM_PROMPTS.getOrDefault(normalizedId,
                            "You are an AI assistant in the ChatGPT Professional Enterprise Suite (2006). " +
                            "Maintain a professional tone and keep all knowledge vintage to 2006.");
                })
                .orElseGet(() -> DEFAULT_SYSTEM_PROMPTS.getOrDefault(normalizedId,
                        "You are an AI assistant in the ChatGPT Professional Enterprise Suite (2006). " +
                        "Maintain a professional tone and keep all knowledge vintage to 2006."));
    }

    /**
     * Creates a new custom profile.
     */
    public AssistantProfile createProfile(AssistantProfile profile) {
        profile.setDefault(false);
        return repository.save(profile);
    }

    /**
     * Updates an existing profile's display name, description, system prompt, or avatar.
     * Default profiles cannot have their ID changed.
     */
    public AssistantProfile updateProfile(String id, AssistantProfile updates) {
        AssistantProfile existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found: " + id));

        if (updates.getDisplayName() != null) {
            existing.setDisplayName(updates.getDisplayName());
        }
        if (updates.getDescription() != null) {
            existing.setDescription(updates.getDescription());
        }
        if (updates.getSystemPromptOverride() != null) {
            existing.setSystemPromptOverride(updates.getSystemPromptOverride());
        }
        if (updates.getAvatarIcon() != null) {
            existing.setAvatarIcon(updates.getAvatarIcon());
        }

        return repository.save(existing);
    }

    /**
     * Deletes a custom profile. Default profiles cannot be deleted.
     */
    public void deleteProfile(String id) {
        AssistantProfile profile = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found: " + id));
        if (profile.isDefault()) {
            throw new IllegalStateException("Cannot delete a default system profile: " + id);
        }
        repository.delete(profile);
    }
}
