package com.openai.chat2006;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Chat2006Application {
    public static void main(String[] args) {
        try {
            java.nio.file.Path dbPath = java.nio.file.Paths.get("c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\database");
            if (!java.nio.file.Files.exists(dbPath)) {
                java.nio.file.Files.createDirectories(dbPath);
            }
        } catch (Exception e) {
            System.err.println("Could not pre-create database directory: " + e.getMessage());
        }
        SpringApplication.run(Chat2006Application.class, args);
    }
}
