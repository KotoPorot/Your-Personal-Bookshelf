package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MyFolderRepository extends JpaRepository<MyFolder, Long> {
    boolean existsByNameAndUserId(String name, Long userId);
}
