package com.openai.chat2006.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/updates")
@CrossOrigin
public class UpdateController {

    @GetMapping("/check")
    public ResponseEntity<?> checkUpdates() {
        return ResponseEntity.ok(Map.of(
                "updateAvailable", true,
                "currentVersion", "1.0.0",
                "newVersion", "1.2.0",
                "downloadSizeMb", 42,
                "estimatedDownloadMinutes", 18,
                "releaseNotes", List.of(
                        "Faster Grammar parsing engine optimization",
                        "Added native support for the Medicine knowledge pack plugin",
                        "Corrected connection timeouts on Dial-Up (56kbps) links",
                        "General stability and dictionary indexing bug fixes"
                )
        ));
    }

    @PostMapping("/download")
    public ResponseEntity<?> downloadUpdate() {
        // Simulate a tiny delay for downloading updates
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Software Update Patch 1.2 downloaded successfully. Run the launcher to execute the patch installation wizard."
        ));
    }
}
