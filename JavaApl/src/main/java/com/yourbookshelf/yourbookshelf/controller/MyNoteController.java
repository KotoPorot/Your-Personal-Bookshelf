package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.service.entity_service.MyNoteService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/notes")
public class MyNoteController {
    private MyNoteService noteService;
}
