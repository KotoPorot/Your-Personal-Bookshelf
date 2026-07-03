package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.service.entity_service.MyBookService;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/books")
public class MyBookController {
    private final MyBookService bookService;

    //work correct
    @PostMapping("/addBook/{shelfId}")
    public ResponseEntity<MyBookResponseDTO> addBook(@AuthenticationPrincipal MyUserPrincipal principal,
                                                     @PathVariable Long shelfId,
                                                     @RequestParam("file") MultipartFile file){

        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.addBook(file, shelfId, principal.getUser()));

    }

    @GetMapping("/getCoverImage/{bookId}")
    public ResponseEntity<Resource> getCoverImage(@AuthenticationPrincipal MyUserPrincipal principal,
                                                  @PathVariable Long bookId){
        return bookService.getCoverImage(bookId, principal.getUser());
    }




    @GetMapping("/getBooks/{shelfId}")
    public ResponseEntity<List<MyBookResponseDTO>> getBooks (@AuthenticationPrincipal MyUserPrincipal principal,
                                                             @PathVariable Long shelfId){
        return ResponseEntity.ok(bookService.getBooks(principal.getUser(), shelfId));
    }

    @DeleteMapping("/deleteBook/{bookId}")
    public ResponseEntity<Void> deleteBook (@AuthenticationPrincipal MyUserPrincipal principal,
                                            @PathVariable Long bookId){
        bookService.deleteBook(bookId, principal.getUser());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
