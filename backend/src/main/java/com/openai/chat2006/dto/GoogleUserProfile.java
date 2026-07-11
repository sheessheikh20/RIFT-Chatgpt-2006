package com.openai.chat2006.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the user profile returned by Google's userinfo endpoint.
 * Fields map directly to the OAuth2 v3 userinfo response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserProfile {

    /** Google's unique user identifier (the "sub" claim) */
    private String id;

    /** Full display name from the Google account */
    private String name;

    /** Primary email address */
    private String email;

    /** Profile picture URL */
    private String picture;
}
