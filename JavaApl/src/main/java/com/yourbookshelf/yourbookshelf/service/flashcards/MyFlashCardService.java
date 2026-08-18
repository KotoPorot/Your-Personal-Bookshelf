package com.yourbookshelf.yourbookshelf.service.flashcards;

import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyExampleResponse;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardRequestDTO;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardResponseDTO;
import com.yourbookshelf.yourbookshelf.DTO.flashcard.MyFlashCardUpdateRequestDTO;
import com.yourbookshelf.yourbookshelf.customException.MyUserDoesNotHaveFlashCardException;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyExample;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFlashCard;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFolder;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyFlashCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<MyFlashCardResponseDTO> getUserFlashCards(MyUser user) {
        List<MyFlashCard> cards = flashCardRepository.findAllByUserIdWithExamples(user.getId());
        return cards.stream().map(mapper::mapToFlashCardResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MyFlashCardResponseDTO> getUserFlashCards(MyUser user, Long folderId) {
        List<MyFlashCard> cards = flashCardRepository.findAllByUserIdAndFolderIdWithExamples(user.getId(), folderId);
        return cards.stream().map(mapper::mapToFlashCardResponse).toList();
    }

    @Transactional
    public MyFlashCardResponseDTO update(MyFlashCardUpdateRequestDTO request, MyUser user) {
        MyFlashCard card = getUserFlashCard(request.id(), user);

        if (!card.getFolder().getId().equals(request.folderId())) {
            card.setFolder(folderService.getUserFolder(request.folderId(), user));
        }

        card.setPhrase(request.phrase());
        card.setPhraseTranslation(request.phraseTranslation());
        card.setTargetLang(request.targetLang());
        card.setDefinition(request.definition());

        updateExamples(request.examples(), card);


        return mapper.mapToFlashCardResponse(flashCardRepository.save(card));
    }

    @Transactional
    public MyFlashCardResponseDTO updateFlashCardFolder(MyUser user, Long cardId, Long newFolderId) {
        MyFlashCard card = getUserFlashCard(cardId, user);
        MyFolder folder = folderService.getUserFolder(newFolderId, user);
        card.setFolder(folder);
        return mapper.mapToFlashCardResponse(flashCardRepository.save(card));
    }

    @Transactional
    public void delete(Long id, MyUser user) {
        MyFlashCard card = getUserFlashCard(id, user);
        flashCardRepository.delete(card);
    }


    private void updateExamples(List<MyExampleResponse> requestExamples, MyFlashCard card) {
        Set<Long> requestIds = requestExamples.stream()
                .map(MyExampleResponse::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        card.getExamples().removeIf(it -> !requestIds.contains(it.getId()));

        for (MyExampleResponse current : requestExamples) {
            if (current.id() != null) {
                card.getExamples().stream().filter(it -> Objects.equals(it.getId(), current.id()))
                        .findFirst().ifPresent(it -> {
                            it.setExample(current.example());
                            it.setTranslation(current.translation());
                            it.setWithoutTargetWords(current.withoutTargetWord());
                        });
            } else {
                MyExample newExample = new MyExample(
                        current.example(),
                        current.translation(),
                        current.withoutTargetWord()
                );
                card.addExample(newExample);
            }
        }
    }

    public MyFlashCard getUserFlashCard(Long id, MyUser user) {
        return flashCardRepository.findByIdAndUserId(id, user.getId()).orElseThrow(
                () -> new MyUserDoesNotHaveFlashCardException("User does not have flashcard with ID: " + id));
    }

}
