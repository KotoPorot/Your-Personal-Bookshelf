package com.yourbookshelf.yourbookshelf.DTO.flashcard;
import java.util.List;

public record MyFlashCardResponseDTO(
        Long id,
        Long folderId,
        String phrase,
        String phraseTranslation,
        String targetLang,
        String definition,
        List<MyExampleResponse> examples
) {}
