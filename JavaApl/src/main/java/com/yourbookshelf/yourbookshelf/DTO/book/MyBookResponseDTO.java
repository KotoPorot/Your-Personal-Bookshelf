package com.yourbookshelf.yourbookshelf.DTO.book;

import lombok.Data;

@Data
public class MyBookResponseDTO {
    private String title;
    private String author;
    private Long shelfId;
    private Long id;
    private String coverImageURL;
    private String bookUrl;
}
