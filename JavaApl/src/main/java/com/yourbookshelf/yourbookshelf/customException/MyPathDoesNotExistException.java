package com.yourbookshelf.yourbookshelf.customException;

public class MyPathDoesNotExistException extends RuntimeException{
    public MyPathDoesNotExistException(String message) {
        super(message);
    }
}
