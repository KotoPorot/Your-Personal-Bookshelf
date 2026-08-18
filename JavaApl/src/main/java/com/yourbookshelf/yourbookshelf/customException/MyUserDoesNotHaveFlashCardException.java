package com.yourbookshelf.yourbookshelf.customException;

public class MyUserDoesNotHaveFlashCardException extends RuntimeException {
    public MyUserDoesNotHaveFlashCardException(String message) {
        super(message);
    }
}
