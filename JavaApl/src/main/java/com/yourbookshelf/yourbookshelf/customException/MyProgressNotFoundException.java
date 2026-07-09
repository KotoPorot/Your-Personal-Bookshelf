package com.yourbookshelf.yourbookshelf.customException;

public class MyProgressNotFoundException extends RuntimeException{
    public MyProgressNotFoundException(String message) {
        super(message);
    }
}
