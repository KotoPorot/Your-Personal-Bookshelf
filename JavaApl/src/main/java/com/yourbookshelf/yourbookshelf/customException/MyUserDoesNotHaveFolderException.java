package com.yourbookshelf.yourbookshelf.customException;

public class MyUserDoesNotHaveFolderException extends RuntimeException {
    public MyUserDoesNotHaveFolderException(String message) {
        super(message);
    }
}
