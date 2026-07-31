package com.yourbookshelf.yourbookshelf.service.ai;

import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MyAIService {
    private final ChatClient client;

    public MyAIService(ChatClient.Builder builder) {
        this.client = builder.build();
    }


    public List<SimplePhrase> generatePhrases(String selectedText, String targetLang,
                                              String context) {
        Prompt prompt = MyPrompts.GENERATE_PHRASES.toPromptTemplate().create(Map.of(
                "targetLang", targetLang,
                "selectedText", selectedText,
                "context", context));

        List<SimplePhrase> phrases = client.prompt(prompt).call().
                entity(new ParameterizedTypeReference<List<SimplePhrase>>() {});

        return phrases;
    }
}
