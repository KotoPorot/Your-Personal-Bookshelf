package com.yourbookshelf.yourbookshelf.repository;

import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MyShelfRepository extends JpaRepository<MyShelf, Long> {

    List<MyShelf> findAllByUser(MyUser myUser);


    boolean existsByShelfNameAndUser(String shelName, MyUser user);

    boolean existsByIdAndUser(Long id, MyUser user);
}
