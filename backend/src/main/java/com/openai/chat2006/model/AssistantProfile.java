package com.openai.chat2006.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents an AI assistant persona/profile.
 * Default profiles are seeded by DatabaseInitializer.
 * Users can create custom profiles on top of the defaults.
 */
@Entity
@Table(name = "assistant_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantProfile {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String id; // e.g. "programmer", "scientist", "teacher"

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Override the default system prompt for this profile.
     * If null, GeminiProvider uses its built-in prompt for this profile ID.
     */
    @Column(name = "system_prompt_override", columnDefinition = "TEXT")
    private String systemPromptOverride;

    /**
     * Icon/emoji identifier for the UI (e.g. "🎓", "🔬", "💼").
     */
    @Column(name = "avatar_icon")
    private String avatarIcon;

    /**
     * Default profiles cannot be deleted.
     */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
