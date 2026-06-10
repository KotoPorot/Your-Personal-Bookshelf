package com.yourbookshelf.yourbookshelf.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users", schema = "my_app_schema")
@Getter
@Setter
@NoArgsConstructor
public class MyUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    public MyUser(String username, String password) {
        this.username = username;
        this.password = password;
    }

}
