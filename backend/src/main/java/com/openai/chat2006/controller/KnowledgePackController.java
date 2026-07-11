package com.openai.chat2006.controller;

import com.openai.chat2006.model.KnowledgePack;
import com.openai.chat2006.service.KnowledgePackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Thin REST controller for Knowledge Pack operations.
 * All business logic is delegated to KnowledgePackService.
 */
@RestController
@RequestMapping("/api/knowledge-packs")
@RequiredArgsConstructor
public class KnowledgePackController {

    private final KnowledgePackService knowledgePackService;

    @GetMapping
    public ResponseEntity<List<KnowledgePack>> getPacks() {
        return ResponseEntity.ok(knowledgePackService.getAllPacks());
    }

    @PostMapping("/{id}/install")
    public ResponseEntity<?> installPack(@PathVariable String id) {
        try {
            KnowledgePack pack = knowledgePackService.installPack(id);
            return ResponseEntity.ok(Map.of(
                    "message", pack.getName() + " installed successfully.",
                    "pack", pack
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/uninstall")
    public ResponseEntity<?> uninstallPack(@PathVariable String id) {
        try {
            KnowledgePack pack = knowledgePackService.uninstallPack(id);
            return ResponseEntity.ok(Map.of(
                    "message", pack.getName() + " uninstalled successfully.",
                    "pack", pack
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }
}
