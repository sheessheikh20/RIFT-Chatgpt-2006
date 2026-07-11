package com.openai.chat2006.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MessageSendResponse {
    private UUID id;
    private String role;
    private String content;
    private LocalDateTime createdAt;
    private long latencyMs;
    private int queriesRemaining;
}
