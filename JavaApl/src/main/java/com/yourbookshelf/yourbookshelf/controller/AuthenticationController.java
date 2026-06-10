package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyUserDTO;
import com.yourbookshelf.yourbookshelf.service.security.UserService;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @NonNull MyUserDTO userDTO) {
        String response = userService.verify(userDTO);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @NonNull MyUserDTO userDTO) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDTO));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(exception.getMessage());
        }
    }

}
