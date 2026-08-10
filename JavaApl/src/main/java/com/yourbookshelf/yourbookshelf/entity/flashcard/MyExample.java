package com.yourbookshelf.yourbookshelf.entity.flashcard;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor

//TODO connect to a database
public class MyExample {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private MyFlashCard flashCard;

    private String example;
}
