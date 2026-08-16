package com.yourbookshelf.yourbookshelf.mapper;

import com.yourbookshelf.yourbookshelf.DTO.book.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.book.MyBookProgressDTO;
import com.yourbookshelf.yourbookshelf.DTO.book.MyBookResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyExampleResponse;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.note.MyNoteRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.note.MyNoteResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.shelf.MyShelfResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyBookProgress;
import com.yourbookshelf.yourbookshelf.entity.MyNote;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyExample;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFlashCard;
import jakarta.validation.Valid;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Component;

import java.util.List;

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

    public MyBook extractMetadataToMyBook(MyBookMetadata metadata) {
        MyBook myBook = new MyBook();
        myBook.setTitle(metadata.getTitle());
        myBook.setAuthor(metadata.getAuthor());
        return myBook;
    }

    public MyBookProgress mapToMyBookProgress(MyBookProgressDTO dto) {
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

    public MyNote mapRequestToNote(MyNoteRequestDTO input) {
        MyNote note = new MyNote();
        note.setSelectedText(input.getSelectedText());
        note.setUserNote(input.getUserNote());
        note.setCfi(input.getCfi());
        note.setBookAuthor(input.getBookAuthor());
        note.setBookTitle(input.getBookTitle());
        note.setCreatedAt(input.getCreatedAt());
        return note;
    }

    public MyNoteResponseDTO mapToNoteResponseDTO(MyNote input) {
        MyNoteResponseDTO dto = new MyNoteResponseDTO();
        dto.setSelectedText(input.getSelectedText());
        dto.setUserNote(input.getUserNote());
        dto.setCfi(input.getCfi());
        dto.setBookAuthor(input.getBookAuthor());
        dto.setBookTitle(input.getBookTitle());
        dto.setCreatedAt(input.getCreatedAt());

        dto.setNoteId(input.getId());
        dto.setBookId(input.getBookId());
        return dto;
    }

    public MyFlashCard extractSimpleCardData(MyFlashCardRequestDTO request) {
        MyFlashCard card = new MyFlashCard();

        card.setTargetLang(request.targetLang());
        card.setPhrase(request.phrase());
        card.setDefinition(request.definition());
        card.setPhraseTranslation(request.phraseTranslation());

        if (request.examples() != null) {
            request.examples().forEach(it ->
                    card.addExample(new MyExample(it.example(), it.translation(), it.withoutTargetWord()))
            );
        }

        return card;
    }

    public MyFlashCardResponseDTO mapToFlashCardResponse(MyFlashCard card) {
        List<MyExampleResponse> examples = card.getExamples().stream().map(it -> new MyExampleResponse(
                it.getExample(), it.getTranslation(), it.getWithoutTargetWords(), it.getId()
        )).toList();
        return new MyFlashCardResponseDTO(
                card.getId(),
                card.getFolder().getId(),
                card.getPhrase(),
                card.getPhraseTranslation(),
                card.getTargetLang(),
                card.getDefinition(),
                examples
        );
    }
}
