package com.yourbookshelf.yourbookshelf.service.ai;

import com.yourbookshelf.yourbookshelf.DTO.ai.SimpleExample;
import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import jakarta.validation.constraints.NotBlank;
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

    public MyAIService(ChatClient.Builder builder) {
        this.client = builder.build();
    }


    public List<SimplePhrase> generatePhrases(String selectedText, String targetLang,
                                              String context) {
        var converter = createConverter(new ParameterizedTypeReference<List<SimplePhrase>>() {
        });

        Prompt prompt = MyPrompts.GENERATE_PHRASES.toPromptTemplate().create(Map.of(
                "targetLang", targetLang,
                "selectedText", selectedText,
                "context", context,
                "format", converter.getFormat()));

        List<SimplePhrase> phrases = client.prompt(prompt).call().
                entity(new ParameterizedTypeReference<List<SimplePhrase>>() {
                });

        return phrases;
    }

    public List<SimpleExample> generateExamples(@NotBlank String phrase, @NotBlank String lang,
                                                PromptTemplate template) {
        var converter = createConverter(new ParameterizedTypeReference<List<SimpleExample>>() {
        });

        Prompt prompt = template.create(Map.of(
                "phrase", phrase,
                "lang", lang,
                "format", converter.getFormat()
        ));

        return client.prompt(prompt).call().entity(new ParameterizedTypeReference<List<SimpleExample>>() {
        });
    }

    private <T> BeanOutputConverter<T> createConverter(ParameterizedTypeReference<T> typeRef) {
        return new BeanOutputConverter<>(typeRef);
    }

}

