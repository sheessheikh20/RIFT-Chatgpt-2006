package com.openai.chat2006.service;

import com.openai.chat2006.model.KnowledgePack;
import com.openai.chat2006.repository.KnowledgePackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic layer for Knowledge Pack management.
 * Controls installation, uninstallation, and disk synchronization.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgePackService {

    private static final List<String> CORE_PACKS = List.of("programming", "mathematics", "history", "dictionary", "grammar");

    private final KnowledgePackRepository repository;
    private final LocalDataService localDataService;

    public List<KnowledgePack> getAllPacks() {
        return repository.findAll();
    }

    public KnowledgePack getPackById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Knowledge pack not found: " + id));
    }

    /**
     * Marks a knowledge pack as installed and creates its disk marker file.
     */
    public KnowledgePack installPack(String id) {
        KnowledgePack pack = getPackById(id);

        if (pack.isInstalled()) {
            log.info("Knowledge pack '{}' is already installed.", id);
            return pack;
        }

        pack.setInstalled(true);
        KnowledgePack saved = repository.save(pack);
        localDataService.registerKnowledgePack(id);
        localDataService.writeLog("KNOWLEDGE", "Knowledge Pack installed: " + pack.getName() + " (" + pack.getSizeMb() + " MB)");
        log.info("Installed knowledge pack: {}", id);
        return saved;
    }

    /**
     * Marks a knowledge pack as uninstalled and removes its disk marker file.
     * Core system packs cannot be uninstalled.
     */
    public KnowledgePack uninstallPack(String id) {
        KnowledgePack pack = getPackById(id);

        if (CORE_PACKS.contains(id)) {
            throw new IllegalStateException("Cannot uninstall core system package: " + pack.getName());
        }

        if (!pack.isInstalled()) {
            log.info("Knowledge pack '{}' is not installed.", id);
            return pack;
        }

        pack.setInstalled(false);
        KnowledgePack saved = repository.save(pack);
        localDataService.unregisterKnowledgePack(id);
        localDataService.writeLog("KNOWLEDGE", "Knowledge Pack uninstalled: " + pack.getName());
        log.info("Uninstalled knowledge pack: {}", id);
        return saved;
    }
}
