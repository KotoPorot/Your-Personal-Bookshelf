package com.yourbookshelf.yourbookshelf.service.translate;

import com.yourbookshelf.yourbookshelf.domain.MyLanguage;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TranslateService {
    private final MyTranslator translator;
    public TranslateService(@Qualifier("myDeepLTranslator") MyTranslator translator) {
        this.translator = translator;
    }

    public String translate(@NotBlank(message = "Cannot be empty") String message,
                            @NotBlank(message = "Should be provided target language") String targetLanguage,
                            String contentLanguage) {
        return translator.translate(message, targetLanguage, contentLanguage);
    }

    public List<MyLanguage> getLanguages() {
        return translator.getLanguages();
    }
}
