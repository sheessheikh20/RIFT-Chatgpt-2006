package com.openai.chat2006.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    /** Nullable: Google-authenticated users have no local password */
    @Column(nullable = false)
    @Builder.Default
    private String password = "";

    @Column(name = "registered_to")
    private String registeredTo;

    @Column(name = "license_type")
    private String licenseType;

    @Column(name = "serial_number", unique = true)
    private String serialNumber;

    @Column(name = "queries_remaining")
    @Builder.Default
    private int queriesRemaining = 500;

    // ── Google OAuth Fields ──────────────────────────────────────────────

    /** Unique Google account ID (sub field from userinfo) */
    @Column(name = "google_id", unique = true)
    private String googleId;

    /** User's primary email address from Google */
    @Column(name = "email")
    private String email;

    /** URL of the Google profile picture */
    @Column(name = "profile_picture", length = 1024)
    private String profilePicture;

    /** Timestamp when this account was first created */
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Timestamp of the most recent successful login */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // ── Spring Security ──────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
