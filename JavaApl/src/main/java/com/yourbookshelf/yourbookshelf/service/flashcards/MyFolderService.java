package com.yourbookshelf.yourbookshelf.service.flashcards;

import com.yourbookshelf.yourbookshelf.customException.MyUserDoesNotHaveFolderException;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.entity.flashcard.MyFolder;
import com.yourbookshelf.yourbookshelf.repository.MyFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyFolderService {
    private final MyFolderRepository folderRepository;

    @Transactional
    public MyFolder create(String name, MyUser user) {
        if (folderRepository.existsByNameAndUserId(name, user.getId())) {
            throw new IllegalArgumentException("Folder with name '" + name + "' already exists for this user.");
        }
        return folderRepository.save(new MyFolder(name, user));
    }

    @Transactional
    public void delete(Long id, MyUser user) {
        MyFolder folder = getUserFolder(id, user);
        folderRepository.delete(folder);
    }

    @Transactional
    public MyFolder update(Long id, MyUser user, String newName) {
        MyFolder folder = getUserFolder(id, user);
        if (!folder.getName().equals(newName) && folderRepository.existsByNameAndUserId(newName, user.getId())) {
            throw new IllegalArgumentException("Folder with name '" + newName + "' already exists for this user.");
        }
        folder.setName(newName);
        return folderRepository.save(folder);
    }

    @Transactional(readOnly = true)
    public MyFolder getUserFolder(Long id, MyUser user) {
        return folderRepository.findByIdAndUserId(id, user.getId()).orElseThrow(
                () -> new MyUserDoesNotHaveFolderException("User does not have folder with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<MyFolder> getUserFolders(MyUser user) {
        return folderRepository.findAllByUser(user);
    }
}
