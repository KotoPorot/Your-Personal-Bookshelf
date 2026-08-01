package com.yourbookshelf.yourbookshelf.service.ai;

import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MyAIService {
    private final ChatClient client;
    private final BeanOutputConverter converter;

    public MyAIService(ChatClient.Builder builder) {
        this.client = builder.build();
        this.converter = new BeanOutputConverter<List<SimplePhrase>>(
                new ParameterizedTypeReference<List<SimplePhrase>>() {});
    }


    public List<SimplePhrase> generatePhrases(String selectedText, String targetLang,
                                              String context) {
        Prompt prompt = MyPrompts.GENERATE_PHRASES.toPromptTemplate().create(Map.of(
                "targetLang", targetLang,
                "selectedText", selectedText,
                "context", context,
                "format", converter.getFormat()));

        List<SimplePhrase> phrases = client.prompt(prompt).call().
                entity(new ParameterizedTypeReference<List<SimplePhrase>>() {});

        return phrases;
    }

    public List<SimplePhrase> generatePhrasesTESTPROMPT(String selectedText, String targetLang,
                                                        String context, PromptTemplate template) {
        Prompt prompt = template.create(Map.of(
                "targetLang", targetLang,
                "selectedText", selectedText,
                "context", context,
                "format", converter.getFormat()));

        List<SimplePhrase> phrases = client.prompt(prompt).call().
                entity(new ParameterizedTypeReference<List<SimplePhrase>>() {});

        return phrases;
    }
}
