package com.yourbookshelf.yourbookshelf.customException;

public class MyUserDoesNotHaveBookException extends RuntimeException{
    public MyUserDoesNotHaveBookException(String message) {
        super(message);
    }
}
