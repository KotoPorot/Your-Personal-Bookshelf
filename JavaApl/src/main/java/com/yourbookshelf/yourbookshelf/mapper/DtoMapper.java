package com.yourbookshelf.yourbookshelf.mapper;

import com.yourbookshelf.yourbookshelf.DTO.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {
    public MyShelfResponseDTO mapToShelfDTO(MyShelf shelf) {
        MyShelfResponseDTO shelfDTO = new MyShelfResponseDTO();
        shelfDTO.setShelfName(shelf.getShelfName());
        shelfDTO.setId(shelf.getId());
        if (shelf.getBooks() != null) {
            shelfDTO.setBooks(shelf.getBooks().stream().map(this::mapToBookDTO).toList());
        }
        return shelfDTO;
    }

    public MyBookResponseDTO mapToBookDTO(MyBook book) {
        MyBookResponseDTO bookDTO = new MyBookResponseDTO();
        bookDTO.setTitle(book.getTitle());
        bookDTO.setId(book.getId());
        bookDTO.setAuthor(book.getAuthor());
        bookDTO.setBookUrl(book.getFilePath());
        bookDTO.setCoverImageURL(book.getCoverPath());
        return bookDTO;
    }

    public MyBook extractMetadataToMyBook(MyBookMetadata metadata){
        MyBook myBook = new MyBook();
        myBook.setTitle(metadata.getTitle());
        myBook.setAuthor(metadata.getAuthor());
        myBook.setFilePath(metadata.getFilePath());
        myBook.setCoverPath(metadata.getCoverPath());
        return myBook;
    }
}
