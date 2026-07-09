package com.yourbookshelf.yourbookshelf.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Data
public class MyBookProgressDTO {
    private Long bookId;
    private String currentCfi;
    private Integer readingTime;
    private Float progress;
    private Integer currentSection;
    private Integer numberOfSections;
    private Integer currentChapterInSection;
    private Integer numberOfChaptersInSection;
    private LocalDateTime timestamp;
}
