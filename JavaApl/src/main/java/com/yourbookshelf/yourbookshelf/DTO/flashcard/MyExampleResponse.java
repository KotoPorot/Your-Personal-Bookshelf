package com.yourbookshelf.yourbookshelf.DTO.flashcard;

public record MyExampleResponse(
        String example,
        String translation,
        String withoutTargetWord,
        Long id
) {}
