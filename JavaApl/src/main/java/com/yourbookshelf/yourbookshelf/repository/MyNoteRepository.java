package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyNoteRepository extends JpaRepository<MyNote, Long> {
}
