package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyBookProgressDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.service.entity_service.MyBookService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
                                                     @RequestParam("file") MultipartFile file) {

        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.addBook(file, shelfId, principal.getUser()));

    }

    @GetMapping("/getCoverImage/{bookId}")
    public ResponseEntity<Resource> getCoverImage(@AuthenticationPrincipal MyUserPrincipal principal,
                                                  @PathVariable Long bookId) {
        return bookService.getCoverImage(bookId, principal.getUser());
    }

    @GetMapping("/getBook/{bookId}")
    public ResponseEntity<Resource> getBook(@AuthenticationPrincipal MyUserPrincipal principal,
                                            @PathVariable Long bookId) {
        return bookService.getFileBook(bookId, principal.getUser());
    }


    @GetMapping("/getBooks/{shelfId}")
    public ResponseEntity<List<MyBookResponseDTO>> getBooks(@AuthenticationPrincipal MyUserPrincipal principal,
                                                            @PathVariable Long shelfId) {
        return ResponseEntity.ok(bookService.getBooks(principal.getUser(), shelfId));
    }

    @DeleteMapping("/deleteBook/{bookId}")
    public ResponseEntity<Void> deleteBook(@AuthenticationPrincipal MyUserPrincipal principal,
                                           @PathVariable Long bookId) {
        bookService.deleteBook(bookId, principal.getUser());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    public record BookTitleUpdate(@NotBlank(
            message = "Title cannot be empty")
                                  String newTitle
    ) {
    }

    @PatchMapping("/rename/{bookId}")
    public ResponseEntity<MyBookResponseDTO> renameBook(@AuthenticationPrincipal MyUserPrincipal principal,
                                                        @PathVariable Long bookId,
                                                        @Valid @RequestBody BookTitleUpdate request) {

        return ResponseEntity.ok(bookService.updateTitle(bookId, request.newTitle(), principal.getUser()));
    }

    public record BookShelfUpdate(
            @NotNull(message = "Shelf ID cannot be null")
            @Positive(message = "Shelf Id must be greater thank 0")
            Long newShelfId
    ) {
    }

    @PatchMapping("/changeShelf/{bookId}")
    public ResponseEntity<MyBookResponseDTO> updateBookShelf(@AuthenticationPrincipal MyUserPrincipal principal,
                                                             @PathVariable Long bookId,
                                                             @Valid @RequestBody BookShelfUpdate request) {

        return ResponseEntity.ok(bookService.updateShelf(bookId, request.newShelfId(), principal.getUser()));
    }

}
