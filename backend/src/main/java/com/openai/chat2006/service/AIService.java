package com.openai.chat2006.service;

import com.openai.chat2006.model.Message;
import java.util.List;

public interface AIService {
    String generateResponse(String prompt, String profile, List<Message> history);
}
