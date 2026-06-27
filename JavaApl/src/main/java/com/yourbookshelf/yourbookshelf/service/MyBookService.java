package com.yourbookshelf.yourbookshelf.service;

import com.yourbookshelf.yourbookshelf.DTO.MyBookRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyBookRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class MyBookService {
    private final MyBookRepository bookRepository;
    private final MyShelfService shelfService;
    private final DtoMapper mapper;

    public MyBookResponseDTO addBook(MyBookRequestDTO requestDTO, Long shelfId, MyUser user) {

        Optional<MyShelf> shelfOpt = shelfService.findShelfByID(shelfId);
        if (shelfOpt.isPresent()) {
            MyShelf shelf = shelfOpt.get();

            if (shelfBelongsUser(shelf, user) && !isShelfHasBook(shelf, requestDTO.getTitle())) {
                MyBook newBook = new MyBook();
                newBook.setShelf(shelf);
                newBook.setTitle(requestDTO.getTitle());
                return mapper.mapToBookDTO(bookRepository.save(newBook));
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<MyBookResponseDTO> getBooks(MyUser user, Long shelfId) {
        Optional<MyShelf> optionalMyShelf = shelfService.findShelfByID(shelfId);
        if (optionalMyShelf.isPresent()) {
            MyShelf shelf = optionalMyShelf.get();
            if (shelfBelongsUser(shelf, user)) {
                return shelf.getBooks().stream().map(mapper::mapToBookDTO).toList();
            }
        }
        return null;

    }

    private boolean shelfBelongsUser(MyShelf shelf, MyUser user) {
        return shelf.getUser().getId().equals(user.getId());
    }

    private boolean isShelfHasBook(MyShelf shelf, String bookTitle) {
        return shelf.getBooks().stream().anyMatch(book -> book.getTitle().equalsIgnoreCase(bookTitle));
    }

    public boolean deleteBook(Long bookId, MyUser user) {
        Optional<MyBook> bookOptional = bookRepository.findById(bookId);
        if (bookOptional.isPresent()) {
            MyBook book = bookOptional.get();

            if (book.getShelf().getUser().getId().equals(user.getId())) {
                bookRepository.delete(book);
                return true;
            }
        }
        return false;
    }
}
