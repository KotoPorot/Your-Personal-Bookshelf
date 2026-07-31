package com.yourbookshelf.yourbookshelf.DTO.note;

import lombok.Data;

import java.time.Instant;

@Data
public class MyNoteResponseDTO {
    private String bookTitle;
    private String cfi;
    private Instant createdAt;
    private String selectedText;
    private String bookAuthor;
    private String userNote;
    private Long bookId;
    private Long noteId;
}
