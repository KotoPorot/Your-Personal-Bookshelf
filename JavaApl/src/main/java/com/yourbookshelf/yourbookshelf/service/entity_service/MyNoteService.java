package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.MyNoteRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyNoteResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyNote;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyNoteRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MyNoteService {
    private MyNoteRepository noteRepo;
    private MyBookService bookService;
    private DtoMapper mapper;

    public MyNoteResponseDTO createNote(MyNoteRequestDTO request, MyUser user) {
        MyBook book = bookService.getUserBook(request.getBookId(), user);

        MyNote note = mapper.mapRequestToNote(request);
        note.setUserId(user.getId());
        note.setBookId(book.getId());

        MyNote savedNote = noteRepo.save(note);
        return mapper.mapToNoteResponseDTO(savedNote);
    }
}
