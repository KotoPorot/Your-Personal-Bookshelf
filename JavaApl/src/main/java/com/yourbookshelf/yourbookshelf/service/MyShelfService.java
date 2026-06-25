package com.yourbookshelf.yourbookshelf.service;

import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.repository.MyShelfRepository;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class MyShelfService {
    private final MyShelfRepository shelfRepository;

    public List<MyShelfResponseDTO> getUserShelves(MyUser user) {
        List<MyShelf> shelves = shelfRepository.findAllByUser(user);

        return shelves.stream().map(this::mapToShelfDTO).toList();

    }

    private MyShelfResponseDTO mapToShelfDTO(MyShelf shelf) {
        MyShelfResponseDTO shelfDTO = new MyShelfResponseDTO();
        shelfDTO.setShelfName(shelf.getShelfName());
        shelfDTO.setId(shelf.getId());
        if (shelf.getBooks() != null) {
            shelfDTO.setBooks(shelf.getBooks().stream().map(this::mapToBookDTO).toList());
        }
        return shelfDTO;
    }

    private MyBookResponseDTO mapToBookDTO(MyBook book) {
        MyBookResponseDTO bookDTO = new MyBookResponseDTO();
        bookDTO.setTitle(book.getTitle());
        bookDTO.setId(book.getId());
        return bookDTO;
    }


    public @Nullable MyShelfResponseDTO saveShelf(String shelfName, MyUser user) {
        if (!shelfRepository.existsByShelfNameAndUser(shelfName, user)) {

            MyShelf shelfToSave = new MyShelf();
            shelfToSave.setShelfName(shelfName);
            shelfToSave.setBooks(new ArrayList<>());
            shelfToSave.setUser(user);
            MyShelf savedShelf = shelfRepository.save(shelfToSave);
            return mapToShelfDTO(savedShelf);
        }
        return null;
    }

    public boolean deleteShelf(Long id, MyUser user) {
        if (shelfRepository.existsByIdAndUser(id, user)){
            shelfRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public MyShelfResponseDTO updateShelfName(Long id, MyUser user, String newName) {
        return shelfRepository.findById(id).filter(shelf -> shelf.getUser().getId().equals(user.getId()))
                .map(shelf -> {
                    shelf.setShelfName(newName);
                    MyShelf updatedShelf = shelfRepository.save(shelf);
                    return mapToShelfDTO(updatedShelf);
                }).orElse(null);
    }
}
