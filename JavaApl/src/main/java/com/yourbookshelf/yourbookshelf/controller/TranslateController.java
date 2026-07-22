package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.service.translate.TranslateService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/translate")
public class TranslateController {
    private final TranslateService translateService;

    public record TranslateRequest(@NotBlank(message = "Cannot be empty")
                                   String message,
                                   @NotBlank(message = "Should be provided target language") String targetLanguage,
                                   @Nullable String contentLanguage
    ) {
    }

    public record TranslateResponse(String response) {
    }

    @PostMapping
    public ResponseEntity<TranslateResponse> translate(@Valid @RequestBody TranslateRequest request) {
        return ResponseEntity.ok(new TranslateResponse(translateService.translate(request.message(),
                request.targetLanguage(), request.contentLanguage())));
    }
}
