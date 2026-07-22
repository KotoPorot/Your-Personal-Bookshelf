package com.yourbookshelf.yourbookshelf.service.translate;

import jakarta.validation.constraints.NotBlank;
import org.springframework.stereotype.Service;

@Service
public class TranslateService {
    public String translate(@NotBlank(message = "Cannot be empty") String message, @NotBlank(message = "Should be provided target language") String targetLanguage, String contentLanguage) {
        return "";
    }
}
