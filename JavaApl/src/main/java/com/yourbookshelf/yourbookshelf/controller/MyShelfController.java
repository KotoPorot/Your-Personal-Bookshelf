package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyShelfRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.service.MyShelfService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/shelves")
public class MyShelfController {
    private final MyShelfService shelfService;


    @GetMapping("/getAll")
    public ResponseEntity<List<MyShelfResponseDTO>> getShelves(@AuthenticationPrincipal MyUserPrincipal principal) {
        return ResponseEntity.ok(shelfService.getUserShelves(principal.getUser()));
    }

    @PostMapping("/createShelf")
    public ResponseEntity<MyShelfResponseDTO> createShelf(@AuthenticationPrincipal MyUserPrincipal principal,
                                                          @RequestBody MyShelfRequestDTO shelfRequest) {

        return ResponseEntity.status(HttpStatus.CREATED).body(shelfService.saveShelf(shelfRequest.getShelfName(), principal.getUser()));

    }

    @DeleteMapping("/deleteShelf/{id}")
    public ResponseEntity<Void> deleteShelf(@AuthenticationPrincipal MyUserPrincipal principal,
                                            @PathVariable Long id) {
        shelfService.deleteShelf(id, principal.getUser());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/updateShelfName/{id}")
    public ResponseEntity<MyShelfResponseDTO> updateShelfName(@AuthenticationPrincipal MyUserPrincipal principal,
                                                              @PathVariable Long id,
                                                              @RequestBody MyShelfRequestDTO newName) {

        return ResponseEntity.ok(shelfService.updateShelfName(id, principal.getUser(), newName.getShelfName()));

    }


}
