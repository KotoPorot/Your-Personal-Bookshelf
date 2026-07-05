package com.yourbookshelf.yourbookshelf.customException;

public class MyInvalidPathException extends RuntimeException{
    public MyInvalidPathException(String message) {
        super(message);
    }
}
