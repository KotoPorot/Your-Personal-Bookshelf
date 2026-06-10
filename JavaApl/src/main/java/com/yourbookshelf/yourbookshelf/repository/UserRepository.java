package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<MyUser, Long> {
    Optional<MyUser> findByUsername(String username);
}
