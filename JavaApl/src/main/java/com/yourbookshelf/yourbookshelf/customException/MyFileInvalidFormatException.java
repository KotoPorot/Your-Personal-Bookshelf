package com.yourbookshelf.yourbookshelf.customException;

public class MyFileInvalidFormatException extends RuntimeException{
    public MyFileInvalidFormatException(String message) {
        super(message);
    }
}
