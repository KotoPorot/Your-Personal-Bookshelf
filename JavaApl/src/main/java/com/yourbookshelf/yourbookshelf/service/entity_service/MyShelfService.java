package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.shelf.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.customException.MyShelfAlreadyExistsException;
import com.yourbookshelf.yourbookshelf.customException.MyUserDoesNotHaveShelfException;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyShelfRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class MyShelfService {
    private final MyShelfRepository shelfRepository;
    private final DtoMapper mapper;

    public List<MyShelfResponseDTO> getUserShelves(MyUser user) {
        List<MyShelf> shelves = shelfRepository.findAllByUser(user);
        return shelves.stream().map(mapper::mapToShelfDTO).toList();

    }

    public MyShelfResponseDTO saveShelf(String shelfName, MyUser user) {
        if (shelfRepository.existsByShelfNameAndUser(shelfName, user)) {
            throw new MyShelfAlreadyExistsException("Shelf " + shelfName + " already exist");
        }
        MyShelf shelfToSave = new MyShelf();
        shelfToSave.setShelfName(shelfName);
        shelfToSave.setBooks(new ArrayList<>());
        shelfToSave.setUser(user);
        MyShelf savedShelf = shelfRepository.save(shelfToSave);
        return mapper.mapToShelfDTO(savedShelf);
    }

    public boolean deleteShelf(Long id, MyUser user) {
        if (!shelfRepository.existsByIdAndUser(id, user)) {
            throw new MyUserDoesNotHaveShelfException("User: " + user.getUsername() + "does not have a shelf");
        }
        shelfRepository.deleteById(id);
        return true;
    }

    public MyShelfResponseDTO updateShelfName(Long id, MyUser user, String newName) {
        MyShelf shelf = shelfRepository.findById(id).filter(
                it -> it.getUser().getId().equals(user.getId())).orElseThrow(
                () -> new MyUserDoesNotHaveShelfException("User: " + user.getUsername() + "does not have a shelf"));

        if (shelfRepository.existsByShelfNameAndUser(newName, user) && !shelf.getShelfName().equalsIgnoreCase(newName)) {
            throw new MyShelfAlreadyExistsException("Shelf " + newName + " already exist");
        }

        shelf.setShelfName(newName);
        MyShelf updatedShelf = shelfRepository.save(shelf);
        return mapper.mapToShelfDTO(updatedShelf);
    }

    public Optional<MyShelf> findShelfByID(Long id) {
        return shelfRepository.findById(id);
    }

    public boolean isShelfBelongsUser(MyShelf shelf, Long userId) {
        return shelf.getUser().getId().equals(userId);
    }

    public boolean isShelfHasBook(MyShelf shelf, String bookTitle) {
        return shelf.getBooks().stream().anyMatch(book -> book.getTitle().equalsIgnoreCase(bookTitle));
    }

    public MyShelf getUserShelf(Long shelfId, MyUser user) {
        return shelfRepository.findById(shelfId).filter(it->it.getUser().getId().equals(user.getId()))
                .orElseThrow(()->new MyUserDoesNotHaveShelfException("Shelf does not belongs user"));
    }
}
