package com.yourbookshelf.yourbookshelf.customException;

public class MyIOException extends RuntimeException{
    public MyIOException(String message) {
        super(message);
    }
}
