package com.yourbookshelf.yourbookshelf.service.ai;

import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MyAIService {
    private final ChatClient client;

    public MyAIService(ChatClient.Builder builder) {
        this.client = builder.build();
    }


    public List<SimplePhrase> generatePhrases(String selectedText, String targetLang,
                                              String context) {
        return new ArrayList<>();
    }
}
