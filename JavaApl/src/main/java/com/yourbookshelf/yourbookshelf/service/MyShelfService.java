package com.yourbookshelf.yourbookshelf.service;

import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyShelfRepository;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
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
        if (!shelfRepository.existsByShelfNameAndUser(shelfName, user)) {

            MyShelf shelfToSave = new MyShelf();
            shelfToSave.setShelfName(shelfName);
            shelfToSave.setBooks(new ArrayList<>());
            shelfToSave.setUser(user);
            MyShelf savedShelf = shelfRepository.save(shelfToSave);
            return mapper.mapToShelfDTO(savedShelf);
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
                    return mapper.mapToShelfDTO(updatedShelf);
                }).orElse(null);
    }

    public Optional<MyShelf> findShelfByID(Long id){
        return shelfRepository.findById(id);
    }
}
