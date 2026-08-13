package com.yourbookshelf.yourbookshelf.entity.flashcard;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "examples", schema = "my_app_schema")

public class MyExample {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private MyFlashCard flashCard;

    @Column(name = "example")
    private String example;
    @Column(name = "ex_translation")
    private String translation;
    @Column(name = "without_target_words")
    private String withoutTargetWords;
}