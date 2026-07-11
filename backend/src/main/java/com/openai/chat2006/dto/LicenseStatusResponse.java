package com.openai.chat2006.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LicenseStatusResponse {
    private String registeredTo;
    private String licenseType;
    private String serialNumber;
    private int queriesRemaining;
}
