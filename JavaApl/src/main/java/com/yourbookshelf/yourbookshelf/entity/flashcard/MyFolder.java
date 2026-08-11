package com.yourbookshelf.yourbookshelf.entity.flashcard;

import com.yourbookshelf.yourbookshelf.entity.MyUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "folders", schema = "my_app_schema")
public class MyFolder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 500)
    private String name;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private MyUser user;


    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MyFlashCard> flashcards = new ArrayList<>();


    public MyFolder(String name, MyUser user) {
        this.name = name;
        this.user = user;
    }

    public void addFlashcard(MyFlashCard card) {
        this.flashcards.add(card);
        card.setFolder(this);
    }

    public void removeFlashcard(MyFlashCard card) {
        this.flashcards.remove(card);
        card.setFolder(null);
    }

}
