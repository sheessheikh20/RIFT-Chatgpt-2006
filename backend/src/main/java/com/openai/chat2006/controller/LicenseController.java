package com.openai.chat2006.controller;

import com.openai.chat2006.dto.LicenseStatusResponse;
import com.openai.chat2006.model.User;
import com.openai.chat2006.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/license")
@RequiredArgsConstructor
public class LicenseController {

    private final UserRepository userRepository;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyLicense(@RequestBody Map<String, String> request) {
        String serialNumber = request.get("serialNumber");
        if (serialNumber == null || serialNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Serial number is required"));
        }

        boolean valid = userRepository.findBySerialNumber(serialNumber.trim()).isPresent();
        if (valid) {
            return ResponseEntity.ok(Map.of("valid", true, "message", "Serial number verified successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "message", "Invalid or unregistered serial number"));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getLicenseStatus(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        return ResponseEntity.ok(LicenseStatusResponse.builder()
                .registeredTo(user.getRegisteredTo())
                .licenseType(user.getLicenseType())
                .serialNumber(user.getSerialNumber())
                .queriesRemaining(user.getQueriesRemaining())
                .build());
    }
}
