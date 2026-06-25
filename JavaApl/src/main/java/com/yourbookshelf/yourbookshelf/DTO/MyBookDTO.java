package com.yourbookshelf.yourbookshelf.DTO;

import com.yourbookshelf.yourbookshelf.entity.MyBook;
import lombok.Data;

@Data
public class MyBookDTO {
    private String title;
    private Long id;
}
