package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.user.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFolder;
import com.yourbookshelf.yourbookshelf.service.flashcards.MyFolderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/flashcards")
public class MyFlashCardController {
    private final MyFolderService folderService;




    public record MyFolderResponse(String name,
                                   Long id){}

    public record MyFolderRequest(@NotBlank String name){}

    @PostMapping("/folders")
    public ResponseEntity<MyFolderResponse> addFolder(@AuthenticationPrincipal MyUserPrincipal principal,
                                                      @RequestBody @Valid MyFolderRequest request){
    MyFolder folder = folderService.create(request.name(), principal.getUser());
    return ResponseEntity.status(HttpStatus.CREATED).body(new MyFolderResponse(folder.getName(), folder.getId()));
    }





}
