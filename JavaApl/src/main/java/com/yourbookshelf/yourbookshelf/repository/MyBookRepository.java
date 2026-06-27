package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyBook;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MyBookRepository extends JpaRepository<MyBook, Long> {
}
