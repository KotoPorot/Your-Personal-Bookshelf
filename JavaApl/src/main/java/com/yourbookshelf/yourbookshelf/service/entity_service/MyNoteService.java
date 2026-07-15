package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.MyNoteRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.MyNoteResponseDTO;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyNote;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyNoteRepository;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MyNoteService {
    private final MyNoteRepository noteRepo;
    private final MyBookService bookService;
    private final DtoMapper mapper;

    public MyNoteResponseDTO createNote(MyNoteRequestDTO request, MyUser user) {
        MyBook book = bookService.getUserBook(request.getBookId(), user);

        MyNote note = mapper.mapRequestToNote(request);
        note.setUserId(user.getId());
        note.setBookId(book.getId());

        MyNote savedNote = noteRepo.save(note);
        return mapper.mapToNoteResponseDTO(savedNote);
    }

    public List<MyNoteResponseDTO> getByBookId(Long bookId, MyUser user) {
        return noteRepo.findByUserIdAndBookId(user.getId(), bookId)
                .stream().map(mapper::mapToNoteResponseDTO).toList();
    }
}
