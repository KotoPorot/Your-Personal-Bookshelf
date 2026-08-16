package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFlashCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MyFlashCardRepository extends JpaRepository<MyFlashCard, Long> {

    @Query("SELECT DISTINCT c FROM MyFlashCard c LEFT JOIN FETCH c.examples WHERE c.user.id = :userId")
    List<MyFlashCard> findAllByUserIdWithExamples(Long userId);

    @Query("SELECT DISTINCT c FROM MyFlashCard c LEFT JOIN FETCH c.examples WHERE c.user.id = :userId AND c.folder.id = :folderId")
    List<MyFlashCard> findAllByUserIdAndFolderIdWithExamples(Long userId, Long folderId);
}
