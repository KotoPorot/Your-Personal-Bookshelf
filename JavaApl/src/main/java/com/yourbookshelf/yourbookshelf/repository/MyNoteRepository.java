package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MyNoteRepository extends JpaRepository<MyNote, Long> {
    List<MyNote> findByUserId(Long id);
    List<MyNote> findByUserIdAndBookId(Long id, Long bookId);
}
