package com.yourbookshelf.yourbookshelf.service.parser;

import com.yourbookshelf.yourbookshelf.DTO.MyBookMetadata;
import nl.siegmann.epublib.domain.Author;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.Resource;
import nl.siegmann.epublib.epub.EpubReader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class EpubService {

    public MyBookMetadata extractMetadata(Book book) {
        MyBookMetadata bookMetadata = new MyBookMetadata();
        bookMetadata.setTitle(book.getMetadata().getFirstTitle());

        if (book.getMetadata().getAuthors() != null && !book.getMetadata().getAuthors().isEmpty()) {
            Author author = book.getMetadata().getAuthors().getFirst();
            if (author != null) {
                bookMetadata.setAuthor(((author.getFirstname() != null ? author.getFirstname() : "") + " "
                        + (author.getLastname() != null ? author.getLastname() : "")).trim());
            }
        }
        return bookMetadata;
    }

    public String getImageFormat(String mediaType) {
        if (mediaType == null) return ".jpg";
        return switch (mediaType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/svg+xml" -> ".svg";
            case "image/jpeg", "image/jpg" -> ".jpg";
            default -> ".jpg";
        };
    }


    public Book getBook(InputStream stream) throws IOException {
        EpubReader reader = new EpubReader();
        return reader.readEpub(stream);
    }

}
