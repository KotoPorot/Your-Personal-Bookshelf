package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardUpdateRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.user.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFlashCard;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFolder;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.service.flashcards.MyFlashCardService;
import com.yourbookshelf.yourbookshelf.service.flashcards.MyFolderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/flashcards")
public class MyFlashCardController {
    private final MyFolderService folderService;
    private final MyFlashCardService flashCardService;
    private final DtoMapper mapper;


    public record MyFolderResponse(String name, Long id) {
    }

    public record MyFolderRequest(@NotBlank String name) {
    }

    @PostMapping("/folders")
    public ResponseEntity<MyFolderResponse> addFolder(@AuthenticationPrincipal MyUserPrincipal principal,
                                                      @RequestBody @Valid MyFolderRequest request) {
        MyFolder folder = folderService.create(request.name(), principal.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(new MyFolderResponse(folder.getName(), folder.getId()));
    }

    @DeleteMapping("/folders/{id}")
    public ResponseEntity<Void> deleteFolder(@AuthenticationPrincipal MyUserPrincipal principal,
                                             @PathVariable Long id) {
        folderService.delete(id, principal.getUser());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/folders/{id}")
    public ResponseEntity<MyFolderResponse> updateFolder(@AuthenticationPrincipal MyUserPrincipal principal,
                                                         @PathVariable Long id,
                                                         @RequestBody @Valid MyFolderRequest request) {
        MyFolder folder = folderService.update(id, principal.getUser(), request.name());
        return ResponseEntity.ok(new MyFolderResponse(folder.getName(), folder.getId()));
    }

    @GetMapping("/folders")
    public ResponseEntity<List<MyFolderResponse>> getFolders(@AuthenticationPrincipal MyUserPrincipal principal) {
        return ResponseEntity.ok(folderService.getUserFolders(principal.getUser()).stream()
                .map(it -> new MyFolderResponse(it.getName(), it.getId()))
                .toList()
        );
    }


    @PostMapping()
    public ResponseEntity<MyFlashCardResponseDTO> addFlashCard(@AuthenticationPrincipal MyUserPrincipal principal,
                                                               @RequestBody @Valid MyFlashCardRequestDTO flashCardRequest) {

        MyFlashCard flashCard = flashCardService.save(flashCardRequest, principal.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.mapToFlashCardResponse(flashCard));
    }


    @GetMapping()
    public ResponseEntity<List<MyFlashCardResponseDTO>> getAllUserFlashCards(@AuthenticationPrincipal MyUserPrincipal principal,
                                                                             @RequestParam(required = false) Long folderId) {
        if (folderId != null) {
            return ResponseEntity.ok(flashCardService.getUserFlashCards(principal.getUser(), folderId));
        }
        return ResponseEntity.ok(flashCardService.getUserFlashCards(principal.getUser()));
    }

    @PutMapping()
    public ResponseEntity<MyFlashCardResponseDTO> updateFlashCard(@AuthenticationPrincipal MyUserPrincipal principal,
                                                                  @RequestBody @Valid MyFlashCardUpdateRequestDTO cardRequestDTO) {
        return ResponseEntity.ok(flashCardService.update(cardRequestDTO, principal.getUser()));
    }

    @PutMapping("/{cardId}/folder/{newFolderId}")
    public ResponseEntity<MyFlashCardResponseDTO> updateFlashCardFolder(@AuthenticationPrincipal MyUserPrincipal principal,
                                                                        @PathVariable Long cardId,
                                                                        @PathVariable Long newFolderId) {
        return ResponseEntity.ok(flashCardService.updateFlashCardFolder(principal.getUser(), cardId, newFolderId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashCard(@AuthenticationPrincipal MyUserPrincipal principal,
                                                @PathVariable Long id) {
        flashCardService.delete(id, principal.getUser());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}

































