package com.openai.chat2006.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "knowledge_packs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgePack {

    @Id
    private String id; // programming, mathematics, history, dictionary, grammar, medicine, finance, astronomy, engineering, legal

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean installed;

    @Column(name = "size_mb", nullable = false)
    private int sizeMb;

    @Column(name = "estimated_download_minutes", nullable = false)
    private int estimatedDownloadMinutes;

    @Column(nullable = false)
    private String category;
}
