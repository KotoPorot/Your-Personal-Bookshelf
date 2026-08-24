package com.yourbookshelf.yourbookshelf.service.book_storage_service;

import com.yourbookshelf.yourbookshelf.DTO.book.MyBookResourceDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface MyBookStorage {
    MyBook addBook(MultipartFile file, MyShelf shelf);
    MyBookResourceDTO getCoverImage(MyBook book);
    boolean deleteBook(MyBook book);
    MyBookResourceDTO getFileBook(MyBook book);
}
