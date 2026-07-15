package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyNoteRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyNoteResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.service.entity_service.MyNoteService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/notes")
public class MyNoteController {
    private final MyNoteService noteService;


    @PostMapping("/add")
    public ResponseEntity<MyNoteResponseDTO> addNote(@AuthenticationPrincipal MyUserPrincipal principal,
                                                      @RequestBody @Valid MyNoteRequestDTO request){

        return ResponseEntity.status(HttpStatus.CREATED).body(noteService.createNote(request, principal.getUser()));
    }

    @GetMapping
    public ResponseEntity<List<MyNoteResponseDTO>> getNotesByBookId(@AuthenticationPrincipal MyUserPrincipal principal,
                                                                     @RequestParam(name = "bookId") Long bookId){
        return ResponseEntity.ok(noteService.getByBookId(bookId, principal.getUser()));
    }


}
