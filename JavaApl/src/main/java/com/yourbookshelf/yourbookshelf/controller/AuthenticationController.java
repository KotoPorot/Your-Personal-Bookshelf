package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.MyUserDTO;
import com.yourbookshelf.yourbookshelf.service.security.MyUserService;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    private final MyUserService myUserService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @NonNull MyUserDTO userDTO) {
        String response = myUserService.verify(userDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @NonNull MyUserDTO userDTO) {
            return ResponseEntity.status(HttpStatus.CREATED).body(myUserService.createUser(userDTO));
    }

}
