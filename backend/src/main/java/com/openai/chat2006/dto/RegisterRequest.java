package com.openai.chat2006.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Owner name (Registered To) is required")
    private String registeredTo;

    private String licenseType = "Professional License"; // e.g. "Professional License", "Enterprise License"
}
