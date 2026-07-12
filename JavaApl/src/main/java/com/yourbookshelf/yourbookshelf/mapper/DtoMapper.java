package com.yourbookshelf.yourbookshelf.mapper;

import com.yourbookshelf.yourbookshelf.DTO.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.MyBookProgressDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyBookProgress;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import org.jspecify.annotations.Nullable;
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
        bookDTO.setShelfId(book.getShelf().getId());
        return bookDTO;
    }

    public MyBook extractMetadataToMyBook(MyBookMetadata metadata){
        MyBook myBook = new MyBook();
        myBook.setTitle(metadata.getTitle());
        myBook.setAuthor(metadata.getAuthor());
        return myBook;
    }

    public MyBookProgress mapToMyBookProgress(MyBookProgressDTO dto){
        MyBookProgress newProgress = new MyBookProgress();
        newProgress.setProgress(dto.getProgress());
        newProgress.setCurrentCfi(dto.getCurrentCfi());
        newProgress.setReadingTime(dto.getReadingTime());
        newProgress.setCurrentSection(dto.getCurrentSection());
        newProgress.setNumberOfSections(dto.getNumberOfSections());
        newProgress.setCurrentChapterInSection(dto.getCurrentChapterInSection());
        newProgress.setNumberOfChaptersInSection(dto.getNumberOfChaptersInSection());
        return newProgress;
    }

    public @Nullable MyBookProgressDTO mapToProgressDTO(MyBookProgress myBookProgress) {
        MyBookProgressDTO dto = new MyBookProgressDTO();
        dto.setProgress(myBookProgress.getProgress());
        dto.setCurrentCfi(myBookProgress.getCurrentCfi());
        dto.setReadingTime(myBookProgress.getReadingTime());
        dto.setCurrentSection(myBookProgress.getCurrentSection());
        dto.setNumberOfSections(myBookProgress.getNumberOfSections());
        dto.setCurrentChapterInSection(myBookProgress.getCurrentChapterInSection());
        dto.setNumberOfChaptersInSection(myBookProgress.getNumberOfChaptersInSection());
        dto.setBookId(myBookProgress.getId());
        dto.setTimestamp(myBookProgress.getTimestamp());
        return dto;
    }
}
