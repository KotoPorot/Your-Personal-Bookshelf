package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.note.MyNoteRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.note.MyNoteResponseDTO;
import com.yourbookshelf.yourbookshelf.customException.MyPermissionException;
import com.yourbookshelf.yourbookshelf.customException.MyResourceNotFoundException;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyNote;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyNoteService {
    private final MyNoteRepository noteRepo;
    private final MyBookService bookService;
    private final DtoMapper mapper;

    @Transactional
    public MyNoteResponseDTO createNote(MyNoteRequestDTO request, MyUser user) {
        MyBook book = bookService.getUserBook(request.getBookId(), user);

        MyNote note = mapper.mapRequestToNote(request);
        note.setUserId(user.getId());
        note.setBookId(book.getId());

        MyNote savedNote = noteRepo.save(note);
        return mapper.mapToNoteResponseDTO(savedNote);
    }

    @Transactional(readOnly = true)
    public List<MyNoteResponseDTO> getByBookId(Long bookId, MyUser user) {
        return noteRepo.findByUserIdAndBookId(user.getId(), bookId)
                .stream().map(mapper::mapToNoteResponseDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<MyNoteResponseDTO> getByUser(MyUser user) {
        return noteRepo.findByUserId(user.getId())
                .stream().map(mapper::mapToNoteResponseDTO).toList();
    }

    @Transactional
    public void deleteNote(Long noteId, MyUser user) {
        MyNote note = noteRepo.findById(noteId)
                .orElseThrow(()-> new MyResourceNotFoundException("note does not exist"));

        if(!note.getUserId().equals(user.getId())){
            throw new MyPermissionException("note does not belongs this user");
        }

        noteRepo.delete(note);
    }
}
