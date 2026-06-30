package com.yourbookshelf.yourbookshelf.customException;

public class MyShelfAlreadyExistsException extends RuntimeException{
    public MyShelfAlreadyExistsException(String message) {
        super(message);
    }
}
