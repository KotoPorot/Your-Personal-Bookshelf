package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.book.MyBookResourceDTO;
import com.yourbookshelf.yourbookshelf.DTO.book.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.customException.*;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyBookRepository;
import com.yourbookshelf.yourbookshelf.service.book_storage_service.MyBookStorage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class MyBookService {

    private final MyBookRepository bookRepository;
    private final MyShelfService shelfService;
    private final DtoMapper mapper;
    private final MyBookStorage storage;

    public MyBookService(MyBookRepository bookRepository, MyShelfService shelfService,
                         DtoMapper mapper,
                         @Qualifier("myCatBoxStorage") MyBookStorage storage) {
        this.bookRepository = bookRepository;
        this.shelfService = shelfService;
        this.mapper = mapper;
        this.storage = storage;
    }

    @Transactional(readOnly = true)
    public List<MyBookResponseDTO> getBooks(MyUser user, Long shelfId) {
        MyShelf shelf = shelfService.findShelfByID(shelfId)
                .orElseThrow(()-> new MyShelfDoesNotFoundException("Shelf with id: " + shelfId + " Not Found"));

        if (!shelfService.isShelfBelongsUser(shelf, user.getId())) {
            throw new MyUserDoesNotHaveShelfException("User: " + user.getUsername() + " does not have a shelf with id: " + shelfId);
        }

        return shelf.getBooks().stream().map(mapper::mapToBookDTO).toList();
    }

    @Transactional
    public MyBookResponseDTO addBook(MultipartFile file, Long shelfId, MyUser user) {
        MyShelf shelf = shelfService.findShelfByID(shelfId).filter(it ->
                it.getUser().getId().equals(user.getId())).orElseThrow(() ->
                new MyUserDoesNotHaveShelfException("Shelf does not belong user"));

        if (!file.getContentType().toLowerCase().contains("epub")) {
            throw new MyFileInvalidFormatException("File must be EPUB)" + " current format: " + file.getContentType().toLowerCase());
        }

        MyBook book = storage.addBook(file, shelf);

        return mapper.mapToBookDTO(bookRepository.save(book));

    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> getCoverImage(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);
        MyBookResourceDTO resource =  storage.getCoverImage(book);

        return ResponseEntity.ok().contentType(MediaType.parseMediaType(resource.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\""
                        + resource.fileName() + "\"")
                .body(resource.resource());
    }

    public MyBook getUserBook(Long bookId, MyUser user) {
        Optional<MyBook> book = bookRepository.findById(bookId);
        return book.filter(it -> it.getShelf().getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new MyUserDoesNotHaveBookException("user does not have a book"));
    }

    @Transactional
    public MyBookResponseDTO updateTitle(Long bookId, String newTitle, MyUser user) {
        if (newTitle == null || newTitle.isEmpty()) {
            throw new MyInvalidArgumentsException("Title cannot be empty");
        }

        MyBook book = getUserBook(bookId, user);

        book.setTitle(newTitle);
        return mapper.mapToBookDTO(bookRepository.save(book));
    }

    @Transactional
    public boolean deleteBook(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);
        bookRepository.delete(book);

        if(!bookRepository.existsByFilePath(book.getFilePath())){
          storage.deleteBook(book);
        }
        return true;
    }


    @Transactional
    public MyBookResponseDTO updateShelf(Long bookId, Long newShelfId, MyUser user) {
        MyBook book = getUserBook(bookId, user);
        MyShelf shelf = shelfService.getUserShelf(newShelfId, user);

        book.setShelf(shelf);
        return mapper.mapToBookDTO(bookRepository.save(book));
    }

    public ResponseEntity<Resource> getFileBook(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);
        MyBookResourceDTO resource = storage.getFileBook(book);

        return ResponseEntity.ok().contentType(MediaType.parseMediaType(resource.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\""
                        + resource.fileName() + "\"")
                .body(resource.resource());
    }


}
