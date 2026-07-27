package com.yourbookshelf.yourbookshelf.service.translate;

import com.yourbookshelf.yourbookshelf.domain.MyLanguage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

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


    @Test
    void getLanguages(){
        //setUP


        //When
        List<MyLanguage> languages = translator.getLanguages();

        System.out.println(languages);

        assertThat(languages).isNotNull();
    }

}