package com.yourbookshelf.yourbookshelf.service;

import com.yourbookshelf.yourbookshelf.repository.MyBookRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MyBookService {
    private final MyBookRepository bookRepository;
}
