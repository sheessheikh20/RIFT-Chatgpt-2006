package com.openai.chat2006.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.chat2006.dto.GoogleUserProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Handles the Google OAuth 2.0 authorization code flow.
 *
 * Uses Java's built-in java.net.http.HttpClient — no additional OAuth library needed.
 * Credentials are read from application.properties which loads them from .env.properties
 * (which is gitignored and never committed).
 *
 * Flow:
 *   1. buildAuthorizationUrl() → redirect user's browser here
 *   2. Google redirects to /api/auth/google/callback?code=...
 *   3. exchangeCodeForProfile(code) → exchanges code for tokens → fetches userinfo
 */
@Slf4j
@Service
public class GoogleOAuthService {

    private static final String TOKEN_ENDPOINT   = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String AUTH_BASE         = "https://accounts.google.com/o/oauth2/v2/auth";

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GoogleOAuthService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Builds the Google OAuth2 consent page URL.
     * Send the user's browser to this URL to start the sign-in flow.
     */
    public String buildAuthorizationUrl() {
        String scope = URLEncoder.encode("openid profile email", StandardCharsets.UTF_8);
        String redirectUriEncoded = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        return AUTH_BASE
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUriEncoded
                + "&response_type=code"
                + "&scope=" + scope
                + "&access_type=offline"
                + "&prompt=select_account";
    }

    /**
     * Exchanges the authorization code for an access token, then fetches the user's
     * profile from Google's userinfo endpoint.
     *
     * @param code The authorization code from the OAuth callback
     * @return GoogleUserProfile with id, name, email, picture
     * @throws IOException if the network request fails or the response is malformed
     */
    public GoogleUserProfile exchangeCodeForProfile(String code) throws IOException, InterruptedException {
        // ── Step 1: Exchange code for access token ────────────────────────────
        String tokenRequestBody = "code="          + URLEncoder.encode(code, StandardCharsets.UTF_8)
                + "&client_id="     + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                + "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8)
                + "&redirect_uri="  + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&grant_type=authorization_code";

        HttpRequest tokenRequest = HttpRequest.newBuilder()
                .uri(URI.create(TOKEN_ENDPOINT))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(tokenRequestBody))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());

        if (tokenResponse.statusCode() != 200) {
            log.error("[Google OAuth] Token exchange failed ({}): {}", tokenResponse.statusCode(), tokenResponse.body());
            throw new IOException("Google token exchange failed: " + tokenResponse.statusCode());
        }

        JsonNode tokenJson = objectMapper.readTree(tokenResponse.body());
        String accessToken = tokenJson.get("access_token").asText();

        // ── Step 2: Fetch user profile with the access token ──────────────────
        HttpRequest profileRequest = HttpRequest.newBuilder()
                .uri(URI.create(USERINFO_ENDPOINT))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> profileResponse = httpClient.send(profileRequest, HttpResponse.BodyHandlers.ofString());

        if (profileResponse.statusCode() != 200) {
            log.error("[Google OAuth] Userinfo request failed ({}): {}", profileResponse.statusCode(), profileResponse.body());
            throw new IOException("Google userinfo request failed: " + profileResponse.statusCode());
        }

        JsonNode profileJson = objectMapper.readTree(profileResponse.body());
        return GoogleUserProfile.builder()
                .id(profileJson.path("sub").asText())
                .name(profileJson.path("name").asText())
                .email(profileJson.path("email").asText())
                .picture(profileJson.path("picture").asText(""))
                .build();
    }
}
