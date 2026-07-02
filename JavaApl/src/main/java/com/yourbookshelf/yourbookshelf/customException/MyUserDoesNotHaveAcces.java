package com.yourbookshelf.yourbookshelf.customException;

public class MyUserDoesNotHaveAcces extends RuntimeException{
    public MyUserDoesNotHaveAcces(String message) {
        super(message);
    }
}
