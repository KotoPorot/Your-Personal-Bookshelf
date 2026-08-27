package com.yourbookshelf.yourbookshelf.service.book_storage_service.file_storage;

import com.yourbookshelf.yourbookshelf.DTO.book.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.book.MyBookResourceDTO;
import com.yourbookshelf.yourbookshelf.customException.MyBookAlreadyExistsOnShelfException;
import com.yourbookshelf.yourbookshelf.customException.MyFileInvalidFormatException;
import com.yourbookshelf.yourbookshelf.customException.MyIOException;
import com.yourbookshelf.yourbookshelf.customException.MyResourceNotFoundException;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.service.book_storage_service.MyBookStorage;
import com.yourbookshelf.yourbookshelf.service.entity_service.MyShelfService;
import com.yourbookshelf.yourbookshelf.service.fileService.MyFileService;
import com.yourbookshelf.yourbookshelf.service.parser.EpubService;
import lombok.RequiredArgsConstructor;
import nl.siegmann.epublib.domain.Book;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Component("fileBookStorage")
@RequiredArgsConstructor
public class MyFileBookStorage implements MyBookStorage {
    private final DtoMapper mapper;
    private final MyShelfService shelfService;
    private final EpubService epubService;
    private final MyFileService fileService;

    @Override
    public MyBook addBook(MultipartFile file, MyShelf shelf) {
        try {
            Book book = epubService.getBook(file.getInputStream());
            MyBookMetadata metadata = epubService.extractMetadata(book);
            MyBook myBook = mapper.extractMetadataToMyBook(metadata);

            if (shelfService.isShelfHasBook(shelf, metadata.getTitle())) {
                throw new MyBookAlreadyExistsOnShelfException("you have already uploaded this book: " + book.getMetadata().getFirstTitle());
            }
            String uuid = UUID.randomUUID().toString();

            Path filePath = fileService.saveFile(file.getInputStream(), uuid + ".epub", fileService.getBOOK_STORAGE_LOCATION());
            myBook.setFilePath(filePath.toString());

            if (book.getCoverImage() != null) {
                String imgFormat = epubService.getImageFormat(book.getCoverImage().getMediaType().toString());
                Path coverImagePath = fileService.saveFile(book.getCoverImage().getInputStream(), uuid + imgFormat, fileService.getCOVER_IMAGE_STORAGE());
                myBook.setCoverPath(coverImagePath.toString());
            }
            myBook.setShelf(shelf);
            return myBook;
        } catch (IOException e) {
            throw new MyIOException(e.getMessage());
        }
    }

    @Override
    public MyBookResourceDTO getCoverImage(MyBook book) {
        Path coverImgPath = fileService.validatePath(book.getCoverPath(), fileService.getCOVER_IMAGE_STORAGE());
        Resource resource = new FileSystemResource(coverImgPath);
        try {
            String contentType = Files.probeContentType(coverImgPath);
            if (contentType == null) {
                throw new MyFileInvalidFormatException("invalid content type");
            }

            return new MyBookResourceDTO(resource, contentType, coverImgPath.getFileName().toString());

        } catch (IOException e) {
            throw new MyResourceNotFoundException("resource not found");
        }
    }

    @Override
    public boolean deleteBook(MyBook book) {
        if (book.getFilePath() != null) {
            fileService.deleteFileFromStorage(book.getFilePath());
        }
        if (book.getCoverPath() != null) {
            fileService.deleteFileFromStorage(book.getCoverPath());
        }
        return true;
    }

    @Override
    public MyBookResourceDTO getFileBook(MyBook book) {
        Path path = fileService.validatePath(book.getFilePath(), fileService.getBOOK_STORAGE_LOCATION());

        Resource resource = new FileSystemResource(path);

        return new MyBookResourceDTO(resource, "application/epub+zip", path.getFileName().toString());

    }

}
