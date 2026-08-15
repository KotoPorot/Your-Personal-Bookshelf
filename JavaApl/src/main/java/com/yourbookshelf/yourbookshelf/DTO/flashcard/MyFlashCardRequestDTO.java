package com.yourbookshelf.yourbookshelf.DTO.flashcard;

import com.yourbookshelf.yourbookshelf.DTO.ai.MyExampleDTO;

import java.util.List;

public record MyFlashCardRequestDTO(
        Long folderId,
        String phrase,
        String phraseTranslation,
        String targetLang,
        String definition,
        List<MyExampleDTO> examples
) {
}
