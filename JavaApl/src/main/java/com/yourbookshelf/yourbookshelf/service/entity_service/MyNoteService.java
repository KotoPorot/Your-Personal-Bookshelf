package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.repository.MyNoteRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MyNoteService {
    private MyNoteRepository noteRepo;
}
