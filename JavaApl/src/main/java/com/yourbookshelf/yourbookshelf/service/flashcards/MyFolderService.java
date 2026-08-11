package com.yourbookshelf.yourbookshelf.service.flashcards;

import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFolder;
import com.yourbookshelf.yourbookshelf.repository.MyFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MyFolderService {
    private final MyFolderRepository folderRepository;

    @Transactional
    public MyFolder create(String name,MyUser user) {
        if(folderRepository.existsByNameAndUserId(name, user.getId())){
            throw new IllegalArgumentException("Folder with name '" + name + "' already exists for this user.");
        }
        return folderRepository.save(new MyFolder(name, user));
    }
}
