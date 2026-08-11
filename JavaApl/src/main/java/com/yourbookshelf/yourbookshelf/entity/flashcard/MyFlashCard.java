package com.yourbookshelf.yourbookshelf.entity.flashcard;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor


//TODO connect to a database
public class MyFlashCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phrase;
    private String definition;
    private String translation;

    @OneToMany
    private List<MyExample> examples;


    @ManyToOne
    @JoinColumn(name = "folder_id", nullable = false)
    private MyFolder folder;
}
