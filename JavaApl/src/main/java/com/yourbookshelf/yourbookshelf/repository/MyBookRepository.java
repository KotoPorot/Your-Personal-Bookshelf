package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MyBookRepository extends JpaRepository<MyBook, Long> {
    boolean existsByFilePath(String filePath);
}
