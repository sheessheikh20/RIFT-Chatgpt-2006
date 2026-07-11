package com.openai.chat2006.controller;

import com.openai.chat2006.dto.AuthRequest;
import com.openai.chat2006.dto.AuthResponse;
import com.openai.chat2006.dto.RegisterRequest;
import com.openai.chat2006.model.User;
import com.openai.chat2006.repository.UserRepository;
import com.openai.chat2006.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final com.openai.chat2006.service.LocalDataService localDataService;

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

    /**
     * Returns the current authenticated user's profile data.
     * Used by the frontend to refresh user information without re-logging in.
     * GET /api/auth/me
     */
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

    private String generate2006SerialNumber() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rand = new Random();
        StringBuilder sb = new StringBuilder();
        for (int block = 0; block < 5; block++) {
            for (int i = 0; i < 5; i++) {
                sb.append(chars.charAt(rand.nextInt(chars.length())));
            }
            if (block < 4) {
                sb.append("-");
            }
        }
        return sb.toString();
    }
}
