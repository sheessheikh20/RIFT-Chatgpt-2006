package com.openai.chat2006.controller;

import com.openai.chat2006.dto.MessageSendRequest;
import com.openai.chat2006.dto.MessageSendResponse;
import com.openai.chat2006.model.Conversation;
import com.openai.chat2006.model.Message;
import com.openai.chat2006.model.User;
import com.openai.chat2006.repository.UserRepository;
import com.openai.chat2006.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Thin REST controller for Conversation operations.
 * All business logic is delegated to ConversationService.
 */
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final UserRepository userRepository;

    @Value("${network.dialup.latency-ms:2500}")
    private int dialupLatency;

    @Value("${network.dsl.latency-ms:1000}")
    private int dslLatency;

    @Value("${network.broadband.latency-ms:400}")
    private int broadbandLatency;

    @Value("${network.lan.latency-ms:50}")
    private int lanLatency;

    // ─── Conversation CRUD ────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Conversation>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) String search
    ) {
        User user = resolveUser(userDetails);
        return ResponseEntity.ok(conversationService.getConversations(user, folder, search));
    }

    @PostMapping
    public ResponseEntity<Conversation> createConversation(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        User user = resolveUser(userDetails);
        Conversation saved = conversationService.createConversation(
                user,
                request.get("title"),
                request.get("folder")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Conversation> updateConversation(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request
    ) {
        Conversation saved = conversationService.updateConversation(id, request.get("title"), request.get("folder"));
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConversation(@PathVariable UUID id) {
        String message = conversationService.deleteConversation(id);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // ─── Messages ─────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable UUID id) {
        return ResponseEntity.ok(conversationService.getMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody MessageSendRequest request
    ) {
        User user = resolveUser(userDetails);

        // Quota check
        if (user.getQueriesRemaining() <= 0) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body(Map.of(
                            "error", "LICENSE_QUOTA_EXCEEDED",
                            "message", "Queries remaining: 0. Your ChatGPT Professional serial key has run out of queries."
                    ));
        }

        long startTime = System.currentTimeMillis();

        // Delegate to service (may throw KnowledgePackMissingException → caught by GlobalExceptionHandler → 428)
        Message assistantMessage = conversationService.sendMessage(
                user, id,
                request.getContent(),
                request.getAssistantProfile(),
                request.getConnectionType()
        );

        long apiDuration = System.currentTimeMillis() - startTime;

        // Apply simulated network latency
        long networkDelay = getNetworkLatency(request.getConnectionType());
        if (networkDelay > 0) {
            try {
                Thread.sleep(networkDelay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        // Reload user to get updated queriesRemaining
        user = resolveUser(userDetails);

        return ResponseEntity.ok(MessageSendResponse.builder()
                .id(assistantMessage.getId())
                .role(assistantMessage.getRole())
                .content(assistantMessage.getContent())
                .createdAt(assistantMessage.getCreatedAt())
                .latencyMs(apiDuration + networkDelay)
                .queriesRemaining(user.getQueriesRemaining())
                .build());
    }

    // ─── Export ───────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportConversation(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "txt") String format
    ) {
        byte[] bytes = conversationService.exportConversation(id, format);

        MediaType mediaType;
        String ext;
        switch (format.toLowerCase()) {
            case "html":
                mediaType = MediaType.TEXT_HTML;
                ext = ".html";
                break;
            case "rtf":
                mediaType = MediaType.parseMediaType("application/rtf");
                ext = ".rtf";
                break;
            default:
                mediaType = MediaType.TEXT_PLAIN;
                ext = ".txt";
                break;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"export" + ext + "\"")
                .contentType(mediaType)
                .body(bytes);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────────

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private long getNetworkLatency(String type) {
        if (type == null) return 0;
        switch (type.toLowerCase()) {
            case "dialup":    return dialupLatency;
            case "dsl":       return dslLatency;
            case "broadband": return broadbandLatency;
            case "lan":       return lanLatency;
            default:          return 0;
        }
    }
}
