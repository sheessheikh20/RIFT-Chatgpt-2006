package com.openai.chat2006.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(KnowledgePackMissingException.class)
    public ResponseEntity<Map<String, Object>> handleKnowledgePackMissing(KnowledgePackMissingException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "KNOWLEDGE_PACK_MISSING");
        body.put("packId", ex.getPackId());
        body.put("packName", ex.getPackName());
        body.put("sizeMb", ex.getSizeMb());
        body.put("estimatedDownloadMinutes", ex.getEstimatedDownloadMinutes());
        body.put("message", ex.getMessage());

        // Using 428 Precondition Required to signal that installation is required
        return new ResponseEntity<>(body, HttpStatus.PRECONDITION_REQUIRED);
    }
}
