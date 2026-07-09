package com.yourbookshelf.yourbookshelf.customException;

public class MyTimeStampIsNotValidException extends RuntimeException{
    public MyTimeStampIsNotValidException(String message) {
        super(message);
    }
}
