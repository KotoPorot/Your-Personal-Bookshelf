package com.yourbookshelf.yourbookshelf.mapper;

import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {
    public MyShelfResponseDTO mapToShelfDTO(MyShelf shelf) {
        MyShelfResponseDTO shelfDTO = new MyShelfResponseDTO();
        shelfDTO.setShelfName(shelf.getShelfName());
        shelfDTO.setId(shelf.getId());
        if (shelf.getBooks() != null) {
            shelfDTO.setBooks(shelf.getBooks().stream().map(this::mapToBookDTO).toList());
        }
        return shelfDTO;
    }

    public MyBookResponseDTO mapToBookDTO(MyBook book) {
        MyBookResponseDTO bookDTO = new MyBookResponseDTO();
        bookDTO.setTitle(book.getTitle());
        bookDTO.setId(book.getId());
        return bookDTO;
    }
}
