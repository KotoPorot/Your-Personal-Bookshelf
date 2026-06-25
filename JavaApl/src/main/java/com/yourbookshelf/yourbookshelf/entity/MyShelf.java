package com.yourbookshelf.yourbookshelf.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shelves", schema = "my_app_schema")
@Getter
@Setter
@NoArgsConstructor
public class MyShelf {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shelfName", nullable = false)
    private String shelfName;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "user_id", nullable = false)
    private MyUser user;

   @OneToMany(mappedBy = "shelf", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MyBook> books = new ArrayList<>();
}
