package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFlashCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MyFlashCardRepository extends JpaRepository<MyFlashCard, Long> {

    @Query("SELECT DISTINCT c FROM MyFlashCard c LEFT JOIN FETCH c.examples WHERE c.user.id = :userId")
    List<MyFlashCard> findAllByUserIdWithExamples(Long userId);

    @Query("SELECT DISTINCT c FROM MyFlashCard c LEFT JOIN FETCH c.examples WHERE c.user.id = :userId AND c.folder.id = :folderId")
    List<MyFlashCard> findAllByUserIdAndFolderIdWithExamples(Long userId, Long folderId);

    @Query("SELECT DISTINCT c FROM MyFlashCard c LEFT JOIN FETCH c.examples WHERE c.id IN :ids AND c.user.id = :userId")
    List<MyFlashCard> findAllByIdInAndUserIdWithExamples(List<Long> ids, Long userId);

    Optional<MyFlashCard> findByIdAndUserId(Long cardId, Long userId);
}
