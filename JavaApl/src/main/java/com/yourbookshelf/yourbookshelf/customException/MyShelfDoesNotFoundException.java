package com.yourbookshelf.yourbookshelf.customException;

public class MyShelfDoesNotFoundException extends RuntimeException{
    public MyShelfDoesNotFoundException(String message) {
        super(message);
    }
}
