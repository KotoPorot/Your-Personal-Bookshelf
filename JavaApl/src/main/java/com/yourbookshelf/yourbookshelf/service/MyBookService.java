package com.yourbookshelf.yourbookshelf.service;

import com.yourbookshelf.yourbookshelf.DTO.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.customException.*;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyBookRepository;
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
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MyBookService {
    private final String BOOK_STORAGE_LOCATION = "JavaApl\\book_storage";

    private final MyBookRepository bookRepository;
    private final MyShelfService shelfService;
    private final DtoMapper mapper;
    private final EpubService epubService;

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


    public MyBookResponseDTO addBook(MultipartFile file, Long shelfId, MyUser user) {
        MyShelf shelf = shelfService.findShelfByID(shelfId).filter(it -> it.getUser().getId().equals(user.getId())).orElseThrow(() -> new MyUserDoesNotHaveShelfException("Shelf does not belong user"));

        if (!file.getContentType().toLowerCase().contains("epub")) {
            throw new MyFileInvalidFormatException("File must be EPUB)" + " current format: " + file.getContentType().toLowerCase());
        }

        Path localPath = saveBookInStorage(file, shelf);

        MyBookMetadata metadata = epubService.extractMetadata(localPath);

        MyBook myBook = mapper.extractMetadataToMyBook(metadata);
        if (isShelfHasBook(shelf, myBook.getTitle())) {
            throw new MyBookAlreadyExistsOnShelfException("you have already uploaded this book: " + myBook.getTitle());
        }
        myBook.setShelf(shelf);

        return mapper.mapToBookDTO(bookRepository.save(myBook));

    }

    private Path saveBookInStorage(MultipartFile file, MyShelf shelf) {
        try (InputStream inputStream = file.getInputStream()) {
            EpubReader reader = new EpubReader();
            Book book = reader.readEpub(inputStream);
            if (isShelfHasBook(shelf, book.getMetadata().getFirstTitle())) {
                throw new MyBookAlreadyExistsOnShelfException("you have already uploaded this book: " + book.getMetadata().getFirstTitle());
            }

            Path rootLocation = Paths.get(BOOK_STORAGE_LOCATION);
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            String fileName = UUID.randomUUID().toString() + ".epub";
            Path filePath = rootLocation.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return filePath;


        } catch (IOException e) {
            System.out.println("file did not save in storage");
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<Resource> getCoverImage(Long bookId, MyUser user) {
        MyBook book = getUserBook(bookId, user);

        if(book.getCoverPath()==null||book.getCoverPath().isEmpty()){
            throw new MyPathDoesNotExistException("Book does not have a path");
        }

        Path coverImgPath = Paths.get(book.getCoverPath()).normalize();
        if (!coverImgPath.startsWith(epubService.getCOVER_IMAGE_STORAGE())){
            throw new MyUserDoesNotHaveAcces("user cant read this file");
        }
        Resource resource = new FileSystemResource(coverImgPath);

        try {
            String contentType = Files.probeContentType(coverImgPath);
            //change to placeholder later
            if(contentType==null){
                throw new MyFileInvalidFormatException("invalid content type");
            }
            return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + coverImgPath.getFileName().toString() + "\"")
                    .body(resource);

        } catch (IOException e) {
            throw new MyResourceNotFoundException("resource not found");
        }
    }

    private MyBook getUserBook(Long bookId, MyUser user) {
        Optional<MyBook> book = bookRepository.findById(bookId);
        return book.filter(it->it.getShelf().getUser().getId().equals(user.getId()))
                .orElseThrow(()-> new MyUserDoesNotHaveBookException("user does not have a book"));
    }
}
