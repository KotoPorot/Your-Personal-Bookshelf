package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.customException.*;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyBookRepository;
import com.yourbookshelf.yourbookshelf.service.fileService.MyFileService;
import com.yourbookshelf.yourbookshelf.service.parser.EpubService;
import lombok.AllArgsConstructor;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.epub.EpubReader;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MyBookService {

    private final MyBookRepository bookRepository;
    private final MyShelfService shelfService;
    private final DtoMapper mapper;
    private final EpubService epubService;
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

    public boolean deleteBook(Long bookId, MyUser user) {
        MyBook book = bookRepository.findById(bookId).filter(it -> it.getShelf().getUser().getId().equals(user.getId())).orElseThrow(() -> new MyUserDoesNotHaveBookException("user: " + user.getUsername() + " does not have a book with id: " + bookId));

        fileService.deleteFileFromStorage(book.getFilePath());
        fileService.deleteFileFromStorage(book.getCoverPath());
        bookRepository.delete(book);

        return true;
    }

    public MyBookResponseDTO addBook(MultipartFile file, Long shelfId, MyUser user) {
        MyShelf shelf = shelfService.findShelfByID(shelfId).filter(it -> it.getUser().getId().equals(user.getId())).orElseThrow(() -> new MyUserDoesNotHaveShelfException("Shelf does not belong user"));

        if (!file.getContentType().toLowerCase().contains("epub")) {
            throw new MyFileInvalidFormatException("File must be EPUB)" + " current format: " + file.getContentType().toLowerCase());
        }

        try {
            Book book = epubService.getBook(file.getInputStream());
            MyBookMetadata metadata = epubService.extractMetadata(book);
            MyBook myBook = mapper.extractMetadataToMyBook(metadata);

            if (shelfService.isShelfHasBook(shelf, metadata.getTitle())) {
                throw new MyBookAlreadyExistsOnShelfException("you have already uploaded this book: " + book.getMetadata().getFirstTitle());
            }
            String uuid = UUID.randomUUID().toString();

            Path filePath = fileService.saveFile(file.getInputStream(), uuid+".epub", fileService.getBOOK_STORAGE_LOCATION());
            myBook.setFilePath(filePath.toString());

            if (book.getCoverImage()!=null) {
                String imgFormat = epubService.getImageFormat(book.getCoverImage().getMediaType().toString());
                Path coverImagePath = fileService.saveFile(book.getCoverImage().getInputStream(), uuid + imgFormat, fileService.getCOVER_IMAGE_STORAGE());
                myBook.setCoverPath(coverImagePath.toString());
            }
            myBook.setShelf(shelf);
            return mapper.mapToBookDTO(bookRepository.save(myBook));
        } catch (IOException e) {
            throw new MyIOException(e.getMessage());
        }

    }


    public ResponseEntity<Resource> getCoverImage(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);

        if (book.getCoverPath() == null || book.getCoverPath().isEmpty()) {
            throw new MyPathDoesNotExistException("Book does not have a path");
        }

        Path coverImgPath = Paths.get(book.getCoverPath()).normalize();
        if (!coverImgPath.startsWith(fileService.getCOVER_IMAGE_STORAGE().toString())) {
            throw new MyUserDoesNotHaveAcces("user cant read this file");
        }
        Resource resource = new FileSystemResource(coverImgPath);

        try {
            String contentType = Files.probeContentType(coverImgPath);
            //change to placeholder later
            if (contentType == null) {
                throw new MyFileInvalidFormatException("invalid content type");
            }
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + coverImgPath.getFileName().toString() + "\"").body(resource);

        } catch (IOException e) {
            throw new MyResourceNotFoundException("resource not found");
        }
    }

    private MyBook getUserBook(Long bookId, MyUser user) {
        Optional<MyBook> book = bookRepository.findById(bookId);
        return book.filter(it -> it.getShelf().getUser().getId().equals(user.getId())).orElseThrow(() -> new MyUserDoesNotHaveBookException("user does not have a book"));
    }
}
