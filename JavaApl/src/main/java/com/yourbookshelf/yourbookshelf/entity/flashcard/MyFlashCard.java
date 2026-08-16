package com.yourbookshelf.yourbookshelf.entity.flashcard;

import com.yourbookshelf.yourbookshelf.entity.MyUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "flashcards",schema = "my_app_schema")
public class MyFlashCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private MyUser user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private MyFolder folder;

    @Column(name = "phrase")
    private String phrase;
    @Column(name = "phrase_translation")
    private String phraseTranslation;
    @Column(name = "target_language")
    private String targetLang;
    @Column(name = "definition")
    private String definition;


    @OneToMany(mappedBy = "flashCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MyExample> examples = new ArrayList<>();


    public void addExample(MyExample example) {
        examples.add(example);
        example.setFlashCard(this);
    }

    public void removeExample(MyExample example) {
        examples.remove(example);
        example.setFlashCard(null);
    }
}
