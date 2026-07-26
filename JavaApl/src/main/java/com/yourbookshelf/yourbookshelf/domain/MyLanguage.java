package com.yourbookshelf.yourbookshelf.domain;

import lombok.Data;

@Data
public class MyLanguage {
    private String lang;
    private String name;
    private Boolean usableAsSource;
    private Boolean usableAsTarget;
}
