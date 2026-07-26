package com.yourbookshelf.yourbookshelf.service.translate;

import java.util.List;

public interface MyTranslator<T> {
    String translate(String message, String targetLanguage, String contentLanguage);

    List<T> getLanguages();
}
