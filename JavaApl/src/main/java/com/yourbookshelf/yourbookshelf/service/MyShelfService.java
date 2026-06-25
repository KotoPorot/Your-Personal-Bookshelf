package com.yourbookshelf.yourbookshelf.service;

import com.yourbookshelf.yourbookshelf.DTO.MyBookDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyShelfDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.repository.MyShelfRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MyShelfService {
    private final MyShelfRepository shelfRepository;

    public List<MyShelfDTO> getUserShelves(MyUser user) {
        List<MyShelf> shelves = shelfRepository.findAllByUser(user);

        return shelves.stream().map(this::mapToShelfDTO).toList();

    }

    private MyShelfDTO mapToShelfDTO(MyShelf shelf) {
        MyShelfDTO shelfDTO = new MyShelfDTO();
        shelfDTO.setShelfName(shelf.getShelfName());
        shelfDTO.setId(shelf.getId());
        if (shelf.getBooks() != null) {
            shelfDTO.setBooks(shelf.getBooks().stream().map(this::mapToBookDTO).toList());
        }
        return shelfDTO;
    }

    private MyBookDTO mapToBookDTO(MyBook book) {
        MyBookDTO bookDTO = new MyBookDTO();
        bookDTO.setTitle(book.getTitle());
        bookDTO.setId(book.getId());
        return bookDTO;
    }


}
