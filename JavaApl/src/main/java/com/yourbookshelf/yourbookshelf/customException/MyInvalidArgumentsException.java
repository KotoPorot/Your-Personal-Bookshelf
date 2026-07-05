package com.yourbookshelf.yourbookshelf.customException;

public class MyInvalidArgumentsException extends RuntimeException{
    public MyInvalidArgumentsException(String message) {
        super(message);
    }
}
