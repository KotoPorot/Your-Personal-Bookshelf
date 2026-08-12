package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MyFolderRepository extends JpaRepository<MyFolder, Long> {
    boolean existsByNameAndUserId(String name, Long userId);

    List<MyFolder> findAllByUser(MyUser user);

    Optional<MyFolder> findByIdAndUserId(Long id, Long id1);
}
