package com.yourbookshelf.yourbookshelf.customException;

public class MyBookAlreadyExistsOnShelfException extends RuntimeException {
    public MyBookAlreadyExistsOnShelfException(String message) {
        super(message);
    }
}
