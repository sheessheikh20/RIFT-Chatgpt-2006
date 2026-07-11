package com.openai.chat2006.exception;

import lombok.Getter;

@Getter
public class KnowledgePackMissingException extends RuntimeException {
    private final String packId;
    private final String packName;
    private final int sizeMb;
    private final int estimatedDownloadMinutes;

    public KnowledgePackMissingException(String packId, String packName, int sizeMb, int estimatedDownloadMinutes) {
        super("Knowledge Pack Missing: " + packName);
        this.packId = packId;
        this.packName = packName;
        this.sizeMb = sizeMb;
        this.estimatedDownloadMinutes = estimatedDownloadMinutes;
    }
}
