package com.openai.chat2006.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MessageSendRequest {
    @NotBlank(message = "Message content is required")
    private String content;

    private String assistantProfile = "Teacher"; // Teacher, Scientist, Business Consultant, Creative Writer, Programmer, Historian

    private String connectionType = "dsl"; // dialup, dsl, broadband, lan, offline
}
