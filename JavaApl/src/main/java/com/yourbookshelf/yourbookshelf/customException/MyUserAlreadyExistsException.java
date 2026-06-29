package com.yourbookshelf.yourbookshelf.customException;

public class MyUserAlreadyExistsException extends RuntimeException {

    public MyUserAlreadyExistsException (String message){
        super(message);
    }
}
