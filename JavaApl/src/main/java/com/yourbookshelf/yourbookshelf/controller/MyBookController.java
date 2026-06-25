package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.service.MyBookService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/books")
public class MyBookController {
    private final MyBookService bookService;
}
