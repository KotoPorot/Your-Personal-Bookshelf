package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyBookRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.service.MyBookService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/books")
public class MyBookController {
    private final MyBookService bookService;

    @PostMapping("/addBook/{shelfId}")
    public ResponseEntity<MyBookResponseDTO> addBook(@AuthenticationPrincipal MyUserPrincipal principal,
                                                     @PathVariable Long shelfId,
                                                     @RequestBody MyBookRequestDTO title){

        MyBookResponseDTO response = bookService.addBook(title, shelfId, principal.getUser());
        if(response!=null){
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

    }

    @GetMapping("/getBooks/{shelfId}")
    public ResponseEntity<List<MyBookResponseDTO>> getBooks (@AuthenticationPrincipal MyUserPrincipal principal,
                                                             @PathVariable Long shelfId){
        List<MyBookResponseDTO> response = bookService.getBooks(principal.getUser(), shelfId);
        if (response!=null){
            return ResponseEntity.ok(response);
        }else return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @DeleteMapping("/deleteBook/{bookId}")
    public ResponseEntity<Void> deleteBook (@AuthenticationPrincipal MyUserPrincipal principal,
                                            @PathVariable Long bookId){
        if(bookService.deleteBook(bookId, principal.getUser())){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

    }

}
