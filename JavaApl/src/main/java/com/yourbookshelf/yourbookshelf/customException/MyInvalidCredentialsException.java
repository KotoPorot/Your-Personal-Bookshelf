package com.yourbookshelf.yourbookshelf.customException;

public class MyInvalidCredentialsException extends RuntimeException{

   public MyInvalidCredentialsException (String message){
        super(message);
   }

}
