package com.openai.chat2006.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class LocalDataService {

    private final Path basePath;

    private static final String DEFAULT_SETTINGS = "{\n" +
            "  \"theme\": \"luna-blue\",\n" +
            "  \"assistantProfile\": \"Programmer\",\n" +
            "  \"windowLayout\": \"standard\",\n" +
            "  \"networkPreference\": \"broadband\",\n" +
            "  \"autosave\": true,\n" +
            "  \"startupBehavior\": \"splash\"\n" +
            "}";

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public LocalDataService(@Value("${app.data.base-path:${user.home}/ChatGPT Professional}") String basePath) {
        this.basePath = Paths.get(basePath);
    }

    public Path getBasePath() {
        return basePath;
    }

    /**
     * Initializes directory layout and default configurations.
     */
    public List<String> initializeDirectories() throws IOException {
        List<String> logs = new ArrayList<>();
        logs.add(logEvent("INSTALL", "Started ChatGPT Professional Enterprise Suite installation."));
        logs.add(logEvent("INSTALL", "Target installation path: " + basePath.toAbsolutePath()));

        String[] folders = {"database", "KnowledgePacks", "Sessions", "Cache", "Logs", "Runtime", "Config", "Exports", "Updates", "Backups"};
        for (String folder : folders) {
            Path folderPath = basePath.resolve(folder);
            if (!Files.exists(folderPath)) {
                Files.createDirectories(folderPath);
                logs.add(logEvent("INSTALL", "Created directory: ApplicationData\\" + folder));
            } else {
                logs.add(logEvent("INSTALL", "Directory already exists: ApplicationData\\" + folder));
            }
        }

        // Initialize default settings file
        Path settingsPath = basePath.resolve("Config").resolve("settings.json");
        if (!Files.exists(settingsPath)) {
            Files.createDirectories(settingsPath.getParent());
            Files.writeString(settingsPath, DEFAULT_SETTINGS, StandardCharsets.UTF_8);
            logs.add(logEvent("INSTALL", "Initialized default settings.json in Config\\"));
        }

        // Initialize default pre-installed knowledge packs
        String[] defaultPacks = {"programming", "mathematics", "history", "dictionary", "grammar"};
        Path packsDir = basePath.resolve("KnowledgePacks");
        for (String pack : defaultPacks) {
            Path packFile = packsDir.resolve(pack + ".pack");
            if (!Files.exists(packFile)) {
                Files.createFile(packFile);
                logs.add(logEvent("INSTALL", "Registered core knowledge pack: " + pack + ".pack"));
            }
        }

        // Write install log to disk
        Path installLogPath = basePath.resolve("Logs").resolve("install.log");
        Files.createDirectories(installLogPath.getParent());
        Files.write(installLogPath, logs, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);

        // Write initial app.log entry
        writeLog("SYSTEM", "ChatGPT Professional Enterprise Suite installation completed. Local directory structure active.");

        return logs;
    }

    /**
     * Appends a log line to Logs/app.log
     */
    public void writeLog(String category, String message) {
        String logLine = logEvent(category, message);
        try {
            Path logDir = basePath.resolve("Logs");
            if (!Files.exists(logDir)) {
                Files.createDirectories(logDir);
            }
            Path logFilePath = logDir.resolve("app.log");
            Files.write(logFilePath, Collections.singletonList(logLine), StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) {
            System.err.println("Failed to write to local log file: " + e.getMessage());
        }
    }

    /**
     * Reads log lines from disk.
     */
    public List<String> readLogs(String category, int maxLines) {
        try {
            Path logFile = basePath.resolve("Logs").resolve(
                    "install".equalsIgnoreCase(category) ? "install.log" : "app.log"
            );
            if (!Files.exists(logFile)) {
                return Collections.emptyList();
            }
            List<String> allLines = Files.readAllLines(logFile, StandardCharsets.UTF_8);
            if (allLines.size() <= maxLines) {
                return allLines;
            }
            return allLines.subList(allLines.size() - maxLines, allLines.size());
        } catch (IOException e) {
            return Collections.singletonList("[ERROR] Failed to read logs: " + e.getMessage());
        }
    }

    /**
     * Saves settings json configuration.
     */
    public void saveSettings(String settingsJson) throws IOException {
        Path settingsPath = basePath.resolve("Config").resolve("settings.json");
        Files.createDirectories(settingsPath.getParent());
        Files.writeString(settingsPath, settingsJson, StandardCharsets.UTF_8);
        writeLog("SETTINGS", "User configurations updated and flushed to local settings.json");
    }

    /**
     * Loads settings json configuration.
     */
    public String loadSettings() throws IOException {
        Path settingsPath = basePath.resolve("Config").resolve("settings.json");
        if (!Files.exists(settingsPath)) {
            Files.createDirectories(settingsPath.getParent());
            Files.writeString(settingsPath, DEFAULT_SETTINGS, StandardCharsets.UTF_8);
            return DEFAULT_SETTINGS;
        }
        return Files.readString(settingsPath, StandardCharsets.UTF_8);
    }

    /**
     * Registers a Knowledge Pack by creating a physical marker file on disk.
     */
    public void registerKnowledgePack(String packId) {
        try {
            Path packsDir = basePath.resolve("KnowledgePacks");
            if (!Files.exists(packsDir)) {
                Files.createDirectories(packsDir);
            }
            Path packFile = packsDir.resolve(packId + ".pack");
            if (!Files.exists(packFile)) {
                Files.createFile(packFile);
            }
            writeLog("KNOWLEDGE", "Registered local knowledge pack module: " + packId + ".pack");
        } catch (IOException e) {
            writeLog("ERROR", "Failed to register knowledge pack module " + packId + ": " + e.getMessage());
        }
    }

    /**
     * Unregisters a Knowledge Pack by deleting its physical marker file.
     */
    public void unregisterKnowledgePack(String packId) {
        try {
            Path packFile = basePath.resolve("KnowledgePacks").resolve(packId + ".pack");
            if (Files.exists(packFile)) {
                Files.delete(packFile);
            }
            writeLog("KNOWLEDGE", "Unregistered and removed local knowledge pack module: " + packId + ".pack");
        } catch (IOException e) {
            writeLog("ERROR", "Failed to unregister knowledge pack module " + packId + ": " + e.getMessage());
        }
    }

    /**
     * Saves conversation export content to Exports/ folder.
     */
    public String saveExport(String filename, String content) throws IOException {
        Path exportsDir = basePath.resolve("Exports");
        if (!Files.exists(exportsDir)) {
            Files.createDirectories(exportsDir);
        }
        Path exportFile = exportsDir.resolve(filename);
        Files.writeString(exportFile, content, StandardCharsets.UTF_8);
        writeLog("EXPORT", "Exported thread data saved locally at: Exports\\" + filename);
        return exportFile.toAbsolutePath().toString();
    }

    private String logEvent(String category, String message) {
        return String.format("[%s] [%s] %s", LocalDateTime.now().format(formatter), category.toUpperCase(), message);
    }
}
