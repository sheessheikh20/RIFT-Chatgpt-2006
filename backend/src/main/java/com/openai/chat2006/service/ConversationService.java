package com.openai.chat2006.service;

import com.openai.chat2006.model.Conversation;
import com.openai.chat2006.model.Message;
import com.openai.chat2006.model.User;
import com.openai.chat2006.repository.ConversationRepository;
import com.openai.chat2006.repository.MessageRepository;
import com.openai.chat2006.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Business logic layer for Conversation and Message management.
 * Handles CRUD, message dispatch through KnowledgeEngineService, and export generation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final KnowledgeEngineService knowledgeEngineService;
    private final LocalDataService localDataService;

    // ─── Conversation CRUD ────────────────────────────────────────────────────────

    public List<Conversation> getConversations(User user, String folder, String search) {
        List<Conversation> list;
        if (folder != null && !folder.isBlank()) {
            list = conversationRepository.findByUserAndFolderOrderByUpdatedAtDesc(user, folder.trim());
        } else {
            list = conversationRepository.findByUserOrderByUpdatedAtDesc(user);
        }

        if (search != null && !search.isBlank()) {
            String query = search.trim().toLowerCase();
            list = list.stream()
                    .filter(c -> c.getTitle().toLowerCase().contains(query))
                    .collect(Collectors.toList());
        }
        return list;
    }

    public Conversation createConversation(User user, String title, String folder) {
        Conversation conversation = Conversation.builder()
                .title(title != null ? title : "New Conversation")
                .folder(folder != null ? folder : "Inbox")
                .user(user)
                .build();
        return conversationRepository.save(conversation);
    }

    public Conversation updateConversation(UUID id, String title, String folder) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + id));
        if (title != null) conversation.setTitle(title);
        if (folder != null) conversation.setFolder(folder);
        return conversationRepository.save(conversation);
    }

    /**
     * Soft-deletes by moving to "Deleted" folder. Permanent delete if already in Deleted.
     */
    public String deleteConversation(UUID id) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + id));

        if ("Deleted".equalsIgnoreCase(conversation.getFolder())) {
            conversationRepository.delete(conversation);
            return "Conversation permanently deleted";
        } else {
            conversation.setFolder("Deleted");
            conversationRepository.save(conversation);
            return "Conversation moved to Deleted folder";
        }
    }

    // ─── Messages ─────────────────────────────────────────────────────────────────

    public List<Message> getMessages(UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        return messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
    }

    /**
     * Persists user message, runs the KnowledgeEngine pipeline, persists AI response.
     *
     * @return the saved assistant Message
     */
    public Message sendMessage(
            User user,
            UUID conversationId,
            String content,
            String assistantProfile,
            String connectionType
    ) {
        // Deduct query quota
        if (user.getQueriesRemaining() <= 0) {
            throw new IllegalStateException("LICENSE_QUOTA_EXCEEDED");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        // Deduct query
        user.setQueriesRemaining(user.getQueriesRemaining() - 1);
        userRepository.save(user);

        // Save user message
        Message userMessage = Message.builder()
                .role("user")
                .content(content)
                .conversation(conversation)
                .build();
        messageRepository.save(userMessage);
        localDataService.writeLog("CHAT", "User prompt received on thread: '"
                + conversation.getTitle() + "' (Limit: " + user.getQueriesRemaining() + " queries left)");

        // Update conversation timestamp
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Fetch full history
        List<Message> history = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);

        // Run knowledge engine pipeline (may throw KnowledgePackMissingException → 428)
        String aiResponse = knowledgeEngineService.processMessage(content, assistantProfile, history, connectionType);

        // Save assistant message
        Message assistantMessage = Message.builder()
                .role("assistant")
                .content(aiResponse)
                .assistantProfile(assistantProfile)
                .conversation(conversation)
                .build();
        Message saved = messageRepository.save(assistantMessage);
        localDataService.writeLog("CHAT", "Assistant response generated. Profile: " + assistantProfile);
        return saved;
    }

    // ─── Export ───────────────────────────────────────────────────────────────────

    public byte[] exportConversation(UUID id, String format) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + id));
        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);

        String content;
        String filename = "conversation_" + conversation.getTitle().replaceAll("[^a-zA-Z0-9]", "_");

        if ("html".equalsIgnoreCase(format)) {
            content = buildHtmlExport(conversation, messages);
            filename += ".html";
        } else if ("rtf".equalsIgnoreCase(format)) {
            content = buildRtfExport(conversation, messages);
            filename += ".rtf";
        } else {
            content = buildTxtExport(conversation, messages);
            filename += ".txt";
        }

        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

        try {
            localDataService.saveExport(filename, content);
        } catch (Exception e) {
            localDataService.writeLog("ERROR", "Failed to save local export: " + e.getMessage());
        }

        return bytes;
    }

    // ─── Private Export Builders ──────────────────────────────────────────────────

    private String buildTxtExport(Conversation conv, List<Message> messages) {
        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        StringBuilder sb = new StringBuilder();
        sb.append("=============================================================\n");
        sb.append("CHATGPT PROFESSIONAL ENTERPRISE SUITE (2006 CONCEPT)\n");
        sb.append("=============================================================\n");
        sb.append("Conversation Title: ").append(conv.getTitle()).append("\n");
        sb.append("Export Date: ").append(LocalDateTime.now().format(dtf)).append("\n");
        sb.append("Folder Location: ").append(conv.getFolder()).append("\n");
        sb.append("-------------------------------------------------------------\n\n");

        for (Message msg : messages) {
            String sender = "user".equalsIgnoreCase(msg.getRole())
                    ? "User" : "ChatGPT (" + msg.getAssistantProfile() + ")";
            sb.append("[").append(sender).append("]:\n")
              .append(msg.getContent()).append("\n\n");
        }

        sb.append("-------------------------------------------------------------\n");
        sb.append("End of Transcript. Copyright (C) 2006 OpenAI Corp.\n");
        return sb.toString();
    }

    private String buildHtmlExport(Conversation conv, List<Message> messages) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\n<html>\n<head>\n");
        sb.append("<meta charset=\"UTF-8\">\n");
        sb.append("<title>").append(conv.getTitle()).append(" - Export</title>\n");
        sb.append("<style>\n");
        sb.append("body { font-family: 'MS Sans Serif', Tahoma, Arial, sans-serif; background-color: #ECE9D8; color: #000; padding: 20px; }\n");
        sb.append(".container { border: 2px solid #999; background: #FFF; padding: 15px; max-width: 800px; margin: 0 auto; }\n");
        sb.append("h2 { color: #004E98; margin-top: 0; }\n");
        sb.append(".meta { color: #555; font-size: 12px; margin-bottom: 20px; border-bottom: 1px double #999; padding-bottom: 5px; }\n");
        sb.append(".msg { margin-bottom: 15px; padding: 10px; border: 1px solid #CCC; background: #F8F8F8; }\n");
        sb.append(".user { border-left: 4px solid #0056B3; }\n");
        sb.append(".assistant { border-left: 4px solid #28A745; }\n");
        sb.append(".sender { font-weight: bold; color: #333; margin-bottom: 5px; }\n");
        sb.append("</style>\n</head>\n<body>\n");
        sb.append("<div class=\"container\">\n");
        sb.append("<h2>ChatGPT Professional Enterprise Suite</h2>\n");
        sb.append("<div class=\"meta\">\n");
        sb.append("<b>Conversation:</b> ").append(conv.getTitle()).append("<br/>\n");
        sb.append("<b>Exported:</b> ").append(LocalDateTime.now().format(dtf)).append("<br/>\n");
        sb.append("<b>Folder:</b> ").append(conv.getFolder()).append("\n");
        sb.append("</div>\n");

        for (Message msg : messages) {
            String roleClass = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "assistant";
            String sender = "user".equalsIgnoreCase(msg.getRole())
                    ? "User" : "ChatGPT (" + msg.getAssistantProfile() + ")";
            sb.append("<div class=\"msg ").append(roleClass).append("\">\n");
            sb.append("<div class=\"sender\">").append(sender).append("</div>\n");
            sb.append("<div>").append(msg.getContent().replace("\n", "<br/>")).append("</div>\n");
            sb.append("</div>\n");
        }

        sb.append("<div style=\"font-size: 11px; text-align: center; color: #666; margin-top: 20px;\">");
        sb.append("ChatGPT Professional Suite v1.0.0. Copyright &copy; 2006 OpenAI. All rights reserved.");
        sb.append("</div>\n</div>\n</body>\n</html>");
        return sb.toString();
    }

    private String buildRtfExport(Conversation conv, List<Message> messages) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        StringBuilder sb = new StringBuilder();
        sb.append("{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0\\fswiss\\fcharset0 Tahoma;}}\n");
        sb.append("{\\colortbl;\\red0\\green0\\blue0;\\red0\\green78\\blue152;\\red40\\green167\\blue69;}\n");
        sb.append("\\f0\\fs20\n");
        sb.append("\\b\\fs28 ChatGPT Professional Enterprise Suite (2006 Transcript)\\b0\\par\\par\n");
        sb.append("\\b Title: \\b0 ").append(conv.getTitle()).append("\\par\n");
        sb.append("\\b Exported: \\b0 ").append(LocalDateTime.now().format(dtf)).append("\\par\n");
        sb.append("\\b Location: \\b0 ").append(conv.getFolder()).append("\\par\n");
        sb.append("\\line\\line\n");

        for (Message msg : messages) {
            if ("user".equalsIgnoreCase(msg.getRole())) {
                sb.append("{\\b\\cf2 User:}\\par ");
            } else {
                sb.append("{\\b\\cf3 ChatGPT (").append(msg.getAssistantProfile()).append("):}\\par ");
            }
            String body = msg.getContent()
                    .replace("\\", "\\\\")
                    .replace("{", "\\{")
                    .replace("}", "\\}")
                    .replace("\n", "\\par ");
            sb.append(body).append("\\par\\par\\line\n");
        }

        sb.append("\\line\\line \\fs16 Copyright 2006 OpenAI Corporation. All rights reserved.\\par\n");
        sb.append("}");
        return sb.toString();
    }
}
