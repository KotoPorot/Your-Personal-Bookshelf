package com.yourbookshelf.yourbookshelf.customException;

public class MyUserDoesNotHaveShelfException extends RuntimeException{
    public MyUserDoesNotHaveShelfException(String message) {
        super(message);
    }
}
