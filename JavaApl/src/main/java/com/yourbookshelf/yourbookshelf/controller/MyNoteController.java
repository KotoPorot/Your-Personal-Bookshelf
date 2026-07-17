package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyNoteRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyNoteResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.service.entity_service.MyNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notes")
public class MyNoteController {
    private final MyNoteService noteService;

    //"/api/v1/notes/create"
    @PostMapping("/create")
    public ResponseEntity<MyNoteResponseDTO> createNote(@AuthenticationPrincipal MyUserPrincipal principal,
                                                        @RequestBody @Valid MyNoteRequestDTO request){

        return ResponseEntity.status(HttpStatus.CREATED).body(noteService.createNote(request, principal.getUser()));
    }

    //"/api/v1/notes/get-user-notes" ==== all user notes
    //"/api/v1/notes/get-user-notes?bookId=1" ==== notes for the book with id 1
    @GetMapping("/get-user-notes")
    public ResponseEntity<List<MyNoteResponseDTO>> getNotesByUserId(@AuthenticationPrincipal MyUserPrincipal principal,
                                                                    @RequestParam(name = "bookId", required = false) Long bookId){

        if (bookId!=null){
            return ResponseEntity.ok(noteService.getByBookId(bookId, principal.getUser()));
        }

        return ResponseEntity.ok(noteService.getByUser(principal.getUser()));
    }

    //"/api/v1/notes/delete/1"  ==== delete note with id 1
    @DeleteMapping("/delete/{noteId}")
    public ResponseEntity<Void> deleteNote(@AuthenticationPrincipal MyUserPrincipal principal,
                                           @PathVariable Long noteId){
        noteService.deleteNote(noteId, principal.getUser());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
