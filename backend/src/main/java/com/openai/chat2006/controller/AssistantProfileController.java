package com.openai.chat2006.controller;

import com.openai.chat2006.model.AssistantProfile;
import com.openai.chat2006.service.AssistantProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing AI assistant profiles.
 * GET /api/assistant-profiles         - List all profiles
 * GET /api/assistant-profiles/{id}    - Get profile by ID
 * POST /api/assistant-profiles        - Create custom profile
 * PUT /api/assistant-profiles/{id}    - Update profile
 * DELETE /api/assistant-profiles/{id} - Delete custom profile (not default)
 */
@RestController
@RequestMapping("/api/assistant-profiles")
@RequiredArgsConstructor
public class AssistantProfileController {

    private final AssistantProfileService profileService;

    @GetMapping
    public ResponseEntity<List<AssistantProfile>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable String id) {
        return profileService.getProfileById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssistantProfile> createProfile(@RequestBody AssistantProfile profile) {
        AssistantProfile created = profileService.createProfile(profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String id,
            @RequestBody AssistantProfile updates
    ) {
        try {
            AssistantProfile updated = profileService.updateProfile(id, updates);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfile(@PathVariable String id) {
        try {
            profileService.deleteProfile(id);
            return ResponseEntity.ok(Map.of("message", "Profile deleted successfully"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
