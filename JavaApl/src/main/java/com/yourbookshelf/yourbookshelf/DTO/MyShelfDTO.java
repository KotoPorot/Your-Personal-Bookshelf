package com.yourbookshelf.yourbookshelf.DTO;

import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import lombok.Data;

import java.util.List;

@Data
public class MyShelfDTO {
    private String shelfName;
    private Long id;
    private List<MyBookDTO> books;
}
