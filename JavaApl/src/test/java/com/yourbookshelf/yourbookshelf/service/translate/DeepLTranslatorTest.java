package com.yourbookshelf.yourbookshelf.service.translate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DeepLTranslatorTest {
    @Autowired
    private DeepLTranslator translator;

    @Test
    void translate(){
        //setUp
        String text = """
                Some text for instance)
                """;
        String targetLang = "ru";
        String sourceLang = "en";


        //when
        String result = translator.translate(text, targetLang, sourceLang);
        System.out.println(result);
        //then
        assertThat(result).isNotBlank();
    }

}