package com.yourbookshelf.yourbookshelf.DTO;

import lombok.Data;

import java.util.List;

@Data
public class MyShelfResponseDTO {
    private String shelfName;
    private Long id;
    private List<MyBookResponseDTO> books;
}
