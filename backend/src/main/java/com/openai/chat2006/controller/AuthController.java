package com.openai.chat2006.controller;

import com.openai.chat2006.dto.AuthRequest;
import com.openai.chat2006.dto.AuthResponse;
import com.openai.chat2006.dto.GoogleUserProfile;
import com.openai.chat2006.dto.RegisterRequest;
import com.openai.chat2006.model.User;
import com.openai.chat2006.repository.UserRepository;
import com.openai.chat2006.security.JwtTokenProvider;
import com.openai.chat2006.service.GoogleOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final com.openai.chat2006.service.LocalDataService localDataService;
    private final GoogleOAuthService googleOAuthService;

    @Value("${google.electron-scheme:chatgpt2006}")
    private String electronScheme;

    // ─── Standard Username/Password Registration ───────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists"));
        }

        String serialNumber = generate2006SerialNumber();
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .registeredTo(request.getRegisteredTo())
                .licenseType(request.getLicenseType())
                .serialNumber(serialNumber)
                .queriesRemaining(500)
                .createdAt(LocalDateTime.now())
                .lastLoginAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        localDataService.writeLog("AUTH", "Registered new administrator: " + request.getUsername() + " (Licensed to: " + request.getRegisteredTo() + ")");

        String jwt = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .registeredTo(user.getRegisteredTo())
                .licenseType(user.getLicenseType())
                .serialNumber(user.getSerialNumber())
                .queriesRemaining(user.getQueriesRemaining())
                .build());
    }

    // ─── Standard Login ────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update last login timestamp
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        localDataService.writeLog("AUTH", "Administrator login success: " + request.getUsername());
        String jwt = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .registeredTo(user.getRegisteredTo())
                .licenseType(user.getLicenseType())
                .serialNumber(user.getSerialNumber())
                .queriesRemaining(user.getQueriesRemaining())
                .build());
    }

    // ─── Guest Session Login ──────────────────────────────────────────────────

    @PostMapping("/guest")
    public ResponseEntity<?> guestLogin() {
        String guestUsername = "guest_" + (System.currentTimeMillis() % 1000000);
        String serialNumber = "GUEST-" + (System.currentTimeMillis() % 1000000);
        
        User user = User.builder()
                .username(guestUsername)
                .password("")
                .registeredTo("Guest Session")
                .licenseType("Evaluation Mode")
                .serialNumber(serialNumber)
                .queriesRemaining(5)
                .createdAt(LocalDateTime.now())
                .lastLoginAt(LocalDateTime.now())
                .build();
                
        userRepository.save(user);
        localDataService.writeLog("AUTH", "Created temporary guest user session: " + guestUsername);
        
        String jwt = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .registeredTo(user.getRegisteredTo())
                .licenseType(user.getLicenseType())
                .serialNumber(user.getSerialNumber())
                .queriesRemaining(user.getQueriesRemaining())
                .build());
    }

    // ─── Current User Profile ──────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return ResponseEntity.ok(AuthResponse.builder()
                .token(null)
                .username(user.getUsername())
                .registeredTo(user.getRegisteredTo())
                .licenseType(user.getLicenseType())
                .serialNumber(user.getSerialNumber())
                .queriesRemaining(user.getQueriesRemaining())
                .build());
    }

    // ─── Google OAuth 2.0 ─────────────────────────────────────────────────────

    /**
     * Step 1: Returns the Google consent page URL.
     * The Electron frontend opens this URL in the user's default browser.
     * GET /api/auth/google/init
     */
    @GetMapping("/google/init")
    public ResponseEntity<?> googleInit() {
        try {
            String authUrl = googleOAuthService.buildAuthorizationUrl();
            log.info("[Google OAuth] Auth URL generated");
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
        } catch (Exception e) {
            log.error("[Google OAuth] Failed to build auth URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Google OAuth configuration error: " + e.getMessage()));
        }
    }

    /**
     * Step 2: Google redirects here after user approves.
     * Exchanges the code for a user profile, upserts the user in the database,
     * generates a JWT, then redirects to the Electron app via the custom protocol.
     * GET /api/auth/google/callback?code=...
     */
    @GetMapping("/google/callback")
    public ResponseEntity<Void> googleCallback(@RequestParam String code) {
        try {
            // Exchange code for user profile
            GoogleUserProfile profile = googleOAuthService.exchangeCodeForProfile(code);
            log.info("[Google OAuth] Profile received for: {} ({})", profile.getName(), profile.getEmail());

            // Upsert: find existing Google user or create a new one
            Optional<User> existingByGoogleId = userRepository.findByGoogleId(profile.getId());
            User user;

            if (existingByGoogleId.isPresent()) {
                // Existing Google user — update last login and profile
                user = existingByGoogleId.get();
                user.setLastLoginAt(LocalDateTime.now());
                user.setProfilePicture(profile.getPicture());
                if (profile.getName() != null && !profile.getName().isBlank()) {
                    user.setRegisteredTo(profile.getName());
                }
                userRepository.save(user);
                log.info("[Google OAuth] Updated existing user: {}", user.getUsername());
            } else {
                // New Google user — check if email is already used by a local account
                String username = sanitizeUsername(profile.getEmail());
                if (userRepository.existsByUsername(username)) {
                    username = username + "_g" + System.currentTimeMillis() % 10000;
                }

                String serialNumber = generate2006SerialNumber();
                user = User.builder()
                        .username(username)
                        .password("") // No local password for Google accounts
                        .registeredTo(profile.getName() != null ? profile.getName() : profile.getEmail())
                        .licenseType("Professional (Google)")
                        .serialNumber(serialNumber)
                        .googleId(profile.getId())
                        .email(profile.getEmail())
                        .profilePicture(profile.getPicture())
                        .queriesRemaining(500)
                        .createdAt(LocalDateTime.now())
                        .lastLoginAt(LocalDateTime.now())
                        .build();
                userRepository.save(user);
                localDataService.writeLog("AUTH", "Google Sign-In: New user registered: " + username + " (" + profile.getEmail() + ")");
                log.info("[Google OAuth] Created new user: {}", username);
            }

            // Generate our own JWT (never expose Google tokens to the client)
            String jwt = jwtTokenProvider.generateToken(user);

            // Encode parameters for the Electron deep link
            String encodedName  = URLEncoder.encode(user.getRegisteredTo() != null ? user.getRegisteredTo() : "", StandardCharsets.UTF_8);
            String encodedEmail = URLEncoder.encode(profile.getEmail() != null ? profile.getEmail() : "", StandardCharsets.UTF_8);
            String encodedPic   = URLEncoder.encode(profile.getPicture() != null ? profile.getPicture() : "", StandardCharsets.UTF_8);

            // Redirect to Electron custom protocol — this wakes up the Electron app
            String deepLink = electronScheme + "://auth?token=" + jwt
                    + "&name=" + encodedName
                    + "&email=" + encodedEmail
                    + "&picture=" + encodedPic;

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(deepLink))
                    .build();

        } catch (Exception e) {
            log.error("[Google OAuth] Callback processing failed", e);
            // Redirect back to Electron with error flag so the UI can show a proper message
            String errorLink = electronScheme + "://auth?error=" +
                    URLEncoder.encode(e.getMessage() != null ? e.getMessage() : "Unknown error", StandardCharsets.UTF_8);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(errorLink))
                    .build();
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String sanitizeUsername(String email) {
        if (email == null || email.isBlank()) return "google_user_" + System.currentTimeMillis() % 100000;
        return email.toLowerCase()
                .replaceAll("[^a-z0-9._-]", "_")
                .replaceAll("_+", "_");
    }

    private String generate2006SerialNumber() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rand = new Random();
        StringBuilder sb = new StringBuilder();
        for (int block = 0; block < 5; block++) {
            for (int i = 0; i < 5; i++) {
                sb.append(chars.charAt(rand.nextInt(chars.length())));
            }
            if (block < 4) sb.append("-");
        }
        return sb.toString();
    }
}
