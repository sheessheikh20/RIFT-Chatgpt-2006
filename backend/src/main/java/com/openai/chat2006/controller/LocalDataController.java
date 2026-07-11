package com.openai.chat2006.controller;

import com.openai.chat2006.service.LocalDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/localdata")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LocalDataController {

    private final LocalDataService localDataService;

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeDirectories() {
        try {
            List<String> logs = localDataService.initializeDirectories();
            localDataService.writeLog("SYSTEM", "Desktop environment directory initialization requested.");
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Local directories and system settings successfully initialized.",
                "logs", logs
            ));
        } catch (IOException e) {
            localDataService.writeLog("ERROR", "Failed to initialize local directories: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Failed to initialize directories on disk: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        try {
            String settingsJson = localDataService.loadSettings();
            return ResponseEntity.ok(settingsJson);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to load settings file: " + e.getMessage());
        }
    }

    @PostMapping("/settings")
    public ResponseEntity<?> saveSettings(@RequestBody String settingsJson) {
        try {
            localDataService.saveSettings(settingsJson);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Configurations successfully saved to local settings.json"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to write to settings file: " + e.getMessage());
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<List<String>> getLogs(
            @RequestParam(defaultValue = "app") String category,
            @RequestParam(defaultValue = "100") int limit) {
        List<String> logLines = localDataService.readLogs(category, limit);
        return ResponseEntity.ok(logLines);
    }
}
