package com.yourbookshelf.yourbookshelf.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notes", schema = "my_app_schema")
@Getter
@Setter
@NoArgsConstructor
public class MyNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_title", nullable = false)
    private String bookTitle;
    @Column(name = "book_author")
    private String bookAuthor;

    @Column(name = "note_text", columnDefinition = "TEXT")
    private String userNote;
    @Column(name = "selected_text",columnDefinition = "TEXT", nullable = false)
    private String selectedText;

    @Column(name = "cfi",columnDefinition = "TEXT", nullable = false)
    private String cfi;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
