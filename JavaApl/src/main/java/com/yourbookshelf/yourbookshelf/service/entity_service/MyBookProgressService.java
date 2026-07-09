package com.yourbookshelf.yourbookshelf.service.entity_service;

import com.yourbookshelf.yourbookshelf.DTO.MyBookProgressDTO;
import com.yourbookshelf.yourbookshelf.customException.MyTimeStampIsNotValidException;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyBookProgress;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.repository.MyBookProgressRepository;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@AllArgsConstructor
public class MyBookProgressService {
    private final MyBookService bookService;
    private final MyBookProgressRepository progressRepository;
    private final DtoMapper mapper;



    @Transactional
    public @Nullable MyBookProgressDTO updateBookProgress(MyBookProgressDTO request, MyUser user) {
        //check that book belongs user
        MyBook book = bookService.getUserBook(request.getBookId(), user);

        Optional<MyBookProgress> progressOptional = progressRepository.findById(request.getBookId());
        if(progressOptional.isEmpty()){
            MyBookProgress newProgress = mapper.mapToMyBookProgress(request);
            newProgress.setBook(book);
            newProgress.setId(book.getId());
            return mapper.mapToProgressDTO(progressRepository.save(newProgress));
        }
        MyBookProgress progress = progressOptional.get();

        //check if request timestamp newest than database data
        if(request.getTimestamp().isBefore(progress.getTimestamp())){
            throw new MyTimeStampIsNotValidException("request timestamp is before actual data");
        }
        progress.setProgress(request.getProgress());
        progress.setReadingTime(request.getReadingTime());
        progress.setCurrentCfi(request.getCurrentCfi());
        progress.setCurrentSection(request.getCurrentSection());
        progress.setCurrentChapterInSection(request.getCurrentChapterInSection());
        progress.setNumberOfSections(request.getNumberOfSections());
        progress.setNumberOfChaptersInSection(request.getNumberOfChaptersInSection());
        return mapper.mapToProgressDTO(progressRepository.save(progress));
    }
}
