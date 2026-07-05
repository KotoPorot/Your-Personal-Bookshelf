package com.yourbookshelf.yourbookshelf.customException;

public class MyShelfDoesNotFounException extends RuntimeException{
    public MyShelfDoesNotFounException(String message) {
        super(message);
    }
}
