package com.yourbookshelf.yourbookshelf.service.parser;

import com.yourbookshelf.yourbookshelf.DTO.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.service.MyBookService;
import nl.siegmann.epublib.domain.Author;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.Resource;
import nl.siegmann.epublib.epub.EpubReader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Service
public class EpubService {
    private final String COVER_IMAGE_STORAGE = "JavaApl\\cover_image_storage";

    public MyBookMetadata extractMetadata(Path localPath) {
        try (InputStream inputStream = Files.newInputStream(localPath, StandardOpenOption.READ)) {
            EpubReader reader = new EpubReader();
            Book book = reader.readEpub(inputStream);

            MyBookMetadata bookMetadata = new MyBookMetadata();
            bookMetadata.setTitle(book.getMetadata().getFirstTitle());

            if (book.getMetadata().getAuthors() != null && !book.getMetadata().getAuthors().isEmpty()) {
                Author author = book.getMetadata().getAuthors().getFirst();
                if (author != null) {
                    bookMetadata.setAuthor(((author.getFirstname() != null ? author.getFirstname() : "") + " "
                            + (author.getLastname() != null ? author.getLastname() : "")).trim());
                }
            }

            if (book.getCoverImage() != null) {
                String coverPath = saveCoverImage(book.getCoverImage()).toString();
                bookMetadata.setCoverPath(coverPath);
            }
            bookMetadata.setFilePath(localPath.toString());

            return bookMetadata;

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Path saveCoverImage(Resource coverImage) {
        try {
            Path rootLocation = Paths.get(COVER_IMAGE_STORAGE);
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }
            String coverImageFileName = UUID.randomUUID().toString() + getFormat(coverImage.getMediaType().toString());
            Path coverImagePath = rootLocation.resolve(coverImageFileName);

            Files.copy(coverImage.getInputStream(), coverImagePath, StandardCopyOption.REPLACE_EXISTING);

            return coverImagePath;


        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    private String getFormat(String mediaType) {
        if (mediaType == null) return ".jpg";
        return switch (mediaType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/svg+xml" -> ".svg";
            case "image/jpeg", "image/jpg" -> ".jpg";
            default -> ".jpg";
        };
    }

    public String getCOVER_IMAGE_STORAGE() {
        return COVER_IMAGE_STORAGE;
    }
}
