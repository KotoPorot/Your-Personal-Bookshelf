package com.yourbookshelf.yourbookshelf.advice;

import com.yourbookshelf.yourbookshelf.DTO.ExceptionResponseDTO;
import com.yourbookshelf.yourbookshelf.customException.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class ExceptionControllerAdvice {

    @ExceptionHandler(MyInvalidCredentialsException.class)
    public ResponseEntity<ExceptionResponseDTO> handleMyInvalidCredentialsException(MyInvalidCredentialsException exp) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ExceptionResponseDTO(exp.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(MyUserAlreadyExistsException.class)
    public ResponseEntity<ExceptionResponseDTO> handleMyUserAlreadyExistsException(MyUserAlreadyExistsException exp) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ExceptionResponseDTO(exp.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(MyShelfAlreadyExistsException.class)
    public ResponseEntity<ExceptionResponseDTO> handleMyShelfAlreadyExistsException(MyShelfAlreadyExistsException exp) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ExceptionResponseDTO(exp.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(MyUserDoesNotHaveShelfException.class)
    public ResponseEntity<ExceptionResponseDTO> handleMyUserDoesNotHaveShelfException(MyUserDoesNotHaveShelfException exp) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ExceptionResponseDTO(exp.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(MyBookAlreadyExistsOnShelfException.class)
    public ResponseEntity<ExceptionResponseDTO> handleMyBookAlreadyExistsOnShelfException(MyBookAlreadyExistsOnShelfException exp){

        System.out.println(exp.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ExceptionResponseDTO(exp.getMessage(), LocalDateTime.now()));
    }

}
