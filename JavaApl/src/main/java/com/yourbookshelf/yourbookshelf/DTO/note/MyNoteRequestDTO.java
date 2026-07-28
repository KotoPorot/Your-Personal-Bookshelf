package com.yourbookshelf.yourbookshelf.DTO.note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.Instant;

@Data
public class MyNoteRequestDTO {

    @NotBlank
    private String bookTitle;
    @NotBlank
    private String cfi;
    @NotNull
    private Instant createdAt;
    @NotBlank
    private String selectedText;

    private String bookAuthor;
    //TODO rename to userComment
    private String userNote;

    @NotNull
    @Positive
    private Long bookId;

}
