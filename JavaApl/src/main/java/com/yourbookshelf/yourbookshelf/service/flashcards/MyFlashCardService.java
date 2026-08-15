package com.yourbookshelf.yourbookshelf.service.flashcards;

import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardRequestDTO;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyExample;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFlashCard;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyFlashCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MyFlashCardService {
    private final DtoMapper mapper;
    private final MyFlashCardRepository flashCardRepository;
    private final MyFolderService folderService;

    @Transactional
    public MyFlashCard save(MyFlashCardRequestDTO request, MyUser user) {
        MyFlashCard card = mapper.extractSimpleCardData(request);
        card.setUser(user);
        card.setFolder(folderService.getUserFolder(request.folderId(), user));

        return flashCardRepository.save(card);
    }
}
