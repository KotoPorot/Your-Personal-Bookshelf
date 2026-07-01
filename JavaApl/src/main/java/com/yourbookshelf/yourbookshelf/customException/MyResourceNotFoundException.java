package com.yourbookshelf.yourbookshelf.customException;

public class MyResourceNotFoundException extends RuntimeException{
    public MyResourceNotFoundException(String message) {
        super(message);
    }
}
