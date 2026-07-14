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

    private String bookAuthor;
    private Instant createdAt;
    private String noteText;

    private String selectedText;
    private String bookTitle;
    private String cfi;

    private Long bookId;
    private Long userId;
}
