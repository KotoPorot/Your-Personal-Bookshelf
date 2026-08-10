package com.yourbookshelf.yourbookshelf.DTO.exception;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ExceptionResponseDTO {
    private String message;
    private LocalDateTime timestamp;
}
