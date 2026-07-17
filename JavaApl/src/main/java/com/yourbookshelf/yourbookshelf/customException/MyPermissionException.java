package com.yourbookshelf.yourbookshelf.customException;

public class MyPermissionException extends RuntimeException{
    public MyPermissionException(String message) {
        super(message);
    }
}
