package com.openai.chat2006.config;

import com.openai.chat2006.model.AssistantProfile;
import com.openai.chat2006.model.KnowledgePack;
import com.openai.chat2006.repository.AssistantProfileRepository;
import com.openai.chat2006.repository.KnowledgePackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final KnowledgePackRepository knowledgePackRepository;
    private final AssistantProfileRepository assistantProfileRepository;

    @Override
    public void run(String... args) throws Exception {
        seedKnowledgePacks();
        seedAssistantProfiles();
    }

    // ─── Knowledge Packs ─────────────────────────────────────────────────────────

    private void seedKnowledgePacks() {
        if (knowledgePackRepository.count() > 0) return;

        List<KnowledgePack> defaultPacks = List.of(
                // Installed by default
                KnowledgePack.builder()
                        .id("programming")
                        .name("Programming Engine")
                        .description("Generics compilation, object-oriented principles, SQL syntaxes, and database queries.")
                        .installed(true)
                        .sizeMb(120)
                        .estimatedDownloadMinutes(5)
                        .category("Technology")
                        .build(),
                KnowledgePack.builder()
                        .id("mathematics")
                        .name("Mathematics Core")
                        .description("Algebra, geometry, statistics, and advanced calculus systems.")
                        .installed(true)
                        .sizeMb(90)
                        .estimatedDownloadMinutes(3)
                        .category("Science")
                        .build(),
                KnowledgePack.builder()
                        .id("history")
                        .name("History Archives")
                        .description("Timelines, Napoleon, World Wars, treaties, and political dynasties.")
                        .installed(true)
                        .sizeMb(150)
                        .estimatedDownloadMinutes(6)
                        .category("Humanities")
                        .build(),
                KnowledgePack.builder()
                        .id("dictionary")
                        .name("Oxford English Dictionary")
                        .description("Comprehensive etymologies, definitions, and vocabulary mappings.")
                        .installed(true)
                        .sizeMb(80)
                        .estimatedDownloadMinutes(3)
                        .category("Language")
                        .build(),
                KnowledgePack.builder()
                        .id("grammar")
                        .name("Language Grammar Engine")
                        .description("Spelling validation, punctuation engine, and clause structure trees.")
                        .installed(true)
                        .sizeMb(75)
                        .estimatedDownloadMinutes(2)
                        .category("Language")
                        .build(),

                // Missing by default — require wizard installation
                KnowledgePack.builder()
                        .id("medicine")
                        .name("Medicine Pack")
                        .description("Clinical diagnostics, surgical procedures, pharmacology database, and pathology records.")
                        .installed(false)
                        .sizeMb(410)
                        .estimatedDownloadMinutes(16)
                        .category("Science")
                        .build(),
                KnowledgePack.builder()
                        .id("finance")
                        .name("Finance Pack")
                        .description("Stock market indexes, investment planning, tax structures, and global macroeconomic indicators.")
                        .installed(false)
                        .sizeMb(180)
                        .estimatedDownloadMinutes(8)
                        .category("Business")
                        .build(),
                KnowledgePack.builder()
                        .id("astronomy")
                        .name("Astronomy Pack")
                        .description("Astrophysics, stars, planetary orbits, black holes, and space flight specifications.")
                        .installed(false)
                        .sizeMb(325)
                        .estimatedDownloadMinutes(12)
                        .category("Science")
                        .build(),
                KnowledgePack.builder()
                        .id("engineering")
                        .name("Engineering & Structural Pack")
                        .description("Civil load calculations, thermodynamics equations, electrical schema analysis, and material statics.")
                        .installed(false)
                        .sizeMb(290)
                        .estimatedDownloadMinutes(11)
                        .category("Technology")
                        .build(),
                KnowledgePack.builder()
                        .id("legal")
                        .name("Legal & Precedent Pack")
                        .description("Commercial codes (UCC), contract standards, intellectual property laws, and case rulings.")
                        .installed(false)
                        .sizeMb(220)
                        .estimatedDownloadMinutes(9)
                        .category("Humanities")
                        .build()
        );

        knowledgePackRepository.saveAll(defaultPacks);
        log.info("Seeded {} knowledge packs.", defaultPacks.size());
    }

    // ─── Assistant Profiles ───────────────────────────────────────────────────────

    private void seedAssistantProfiles() {
        if (assistantProfileRepository.count() > 0) return;

        LocalDateTime now = LocalDateTime.now();

        List<AssistantProfile> defaultProfiles = List.of(
                AssistantProfile.builder()
                        .id("programmer")
                        .displayName("Programmer")
                        .description("Writes clean, well-commented code. Expert in Java, C++, SQL, and early web technologies.")
                        .avatarIcon("💻")
                        .isDefault(true)
                        .createdAt(now)
                        .build(),
                AssistantProfile.builder()
                        .id("scientist")
                        .displayName("Scientist")
                        .description("Responds with precise scientific language, methodical observations, and formal citations.")
                        .avatarIcon("🔬")
                        .isDefault(true)
                        .createdAt(now)
                        .build(),
                AssistantProfile.builder()
                        .id("teacher")
                        .displayName("Teacher")
                        .description("Explains concepts simply and encouragingly. Adds study tips and grades your questions.")
                        .avatarIcon("🎓")
                        .isDefault(true)
                        .createdAt(now)
                        .build(),
                AssistantProfile.builder()
                        .id("business-consultant")
                        .displayName("Business Consultant")
                        .description("Uses corporate vocabulary: ROI, synergy, deliverables. Formats responses as executive briefings.")
                        .avatarIcon("💼")
                        .isDefault(true)
                        .createdAt(now)
                        .build(),
                AssistantProfile.builder()
                        .id("creative-writer")
                        .displayName("Creative Writer")
                        .description("Uses evocative, poetic language with vivid imagery, metaphors, and dramatic literary flair.")
                        .avatarIcon("✍️")
                        .isDefault(true)
                        .createdAt(now)
                        .build(),
                AssistantProfile.builder()
                        .id("historian")
                        .displayName("Historian")
                        .description("Frames all answers chronologically with dates, historical quotes, and key figures.")
                        .avatarIcon("📜")
                        .isDefault(true)
                        .createdAt(now)
                        .build()
        );

        assistantProfileRepository.saveAll(defaultProfiles);
        log.info("Seeded {} assistant profiles.", defaultProfiles.size());
    }
}
