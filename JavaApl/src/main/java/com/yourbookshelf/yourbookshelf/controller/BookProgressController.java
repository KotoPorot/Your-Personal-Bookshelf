package com.yourbookshelf.yourbookshelf.controller;


import com.yourbookshelf.yourbookshelf.DTO.MyBookProgressDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.service.entity_service.MyBookProgressService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/progress")
public class BookProgressController {
    private MyBookProgressService progressService;

    @PatchMapping("/update")
    public ResponseEntity<MyBookProgressDTO> updateMyBookProgress(@AuthenticationPrincipal MyUserPrincipal principal,
                                                                  @RequestBody MyBookProgressDTO request){

        return ResponseEntity.ok(progressService.updateBookProgress(request, principal.getUser()));
    }

    @GetMapping("/get/{bookId}")
    public ResponseEntity<MyBookProgressDTO> getProgress(@AuthenticationPrincipal MyUserPrincipal principal,
                                                         @PathVariable Long bookId){
        return ResponseEntity.ok(progressService.getBookProgress(bookId, principal.getUser()));
    }
}
