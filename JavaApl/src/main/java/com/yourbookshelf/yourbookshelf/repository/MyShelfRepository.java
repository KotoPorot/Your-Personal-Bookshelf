package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MyShelfRepository extends JpaRepository<MyShelf, Long> {

    List<MyShelf> findAllByUser(MyUser myUser);


    boolean existsByShelfNameAndUser(String shelName, MyUser user);
}
