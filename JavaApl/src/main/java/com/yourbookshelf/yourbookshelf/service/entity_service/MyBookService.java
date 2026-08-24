package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.book.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.book.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.customException.*;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyBookRepository;
import com.yourbookshelf.yourbookshelf.service.book_storage.MyBookStorage;
import com.yourbookshelf.yourbookshelf.service.book_storage.file_storage.MyFileBookStorage;
import com.yourbookshelf.yourbookshelf.service.fileService.MyFileService;
import com.yourbookshelf.yourbookshelf.service.parser.EpubService;
import lombok.AllArgsConstructor;
import nl.siegmann.epublib.domain.Book;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MyBookService {

    private final MyBookRepository bookRepository;
    private final MyShelfService shelfService;
    private final DtoMapper mapper;
    private final MyFileService fileService;

    @Transactional(readOnly = true)
    public List<MyBookResponseDTO> getBooks(MyUser user, Long shelfId) {
        Optional<MyShelf> optionalMyShelf = shelfService.findShelfByID(shelfId);
        if (!optionalMyShelf.isPresent()) {
            throw new MyShelfDoesNotFounException("Shelf with id: " + shelfId + " Not Found");
        }
        MyShelf shelf = optionalMyShelf.get();
        if (!shelfService.isShelfBelongsUser(shelf, user.getId())) {
            throw new MyUserDoesNotHaveShelfException("User: " + user.getUsername() + " does not have a shelf with id: " + shelfId);
        }

        return shelf.getBooks().stream().map(mapper::mapToBookDTO).toList();
    }

    public MyBookResponseDTO addBook(MultipartFile file, Long shelfId, MyUser user, MyBookStorage storage) {
        MyShelf shelf = shelfService.findShelfByID(shelfId).filter(it ->
                it.getUser().getId().equals(user.getId())).orElseThrow(() ->
                new MyUserDoesNotHaveShelfException("Shelf does not belong user"));

        if (!file.getContentType().toLowerCase().contains("epub")) {
            throw new MyFileInvalidFormatException("File must be EPUB)" + " current format: " + file.getContentType().toLowerCase());
        }

        MyBook book = storage.addBook(file, shelf);

        return mapper.mapToBookDTO(bookRepository.save(book));

    }




    public ResponseEntity<Resource> getCoverImage(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);

        Path coverImgPath = fileService.validatePath(book.getCoverPath(), fileService.getCOVER_IMAGE_STORAGE());
        Resource resource = new FileSystemResource(coverImgPath);

        try {
            String contentType = Files.probeContentType(coverImgPath);
            //change to placeholder later
            if (contentType == null) {
                throw new MyFileInvalidFormatException("invalid content type");
            }
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\""
                            + coverImgPath.getFileName().toString() + "\"")
                    .body(resource);

        } catch (IOException e) {
            throw new MyResourceNotFoundException("resource not found");
        }
    }

    public MyBook getUserBook(Long bookId, MyUser user) {
        Optional<MyBook> book = bookRepository.findById(bookId);
        return book.filter(it -> it.getShelf().getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new MyUserDoesNotHaveBookException("user does not have a book"));
    }


    public MyBookResponseDTO updateTitle(Long bookId, String newTitle, MyUser user) {
        if (newTitle == null || newTitle.isEmpty()) {
            throw new MyInvalidArgumentsException("Title cannot be empty");
        }

        MyBook book = getUserBook(bookId, user);

        book.setTitle(newTitle);
        return mapper.mapToBookDTO(bookRepository.save(book));
    }

    public boolean deleteBook(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);
        fileService.deleteFileFromStorage(book.getFilePath());
        fileService.deleteFileFromStorage(book.getCoverPath());
        bookRepository.delete(book);

        return true;
    }


    public MyBookResponseDTO updateShelf(Long bookId, Long newShelfId, MyUser user) {
        MyBook book = getUserBook(bookId, user);
        MyShelf shelf = shelfService.getUserShelf(newShelfId, user);

        book.setShelf(shelf);
        return mapper.mapToBookDTO(bookRepository.save(book));
    }

    public ResponseEntity<Resource> getFileBook(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);

        Path path = fileService.validatePath(book.getFilePath(), fileService.getBOOK_STORAGE_LOCATION());

        Resource resource = new FileSystemResource(path);

        return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/epub+zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\""
                +path.getFileName().toString()+"\"")
                .body(resource);
    }


}
