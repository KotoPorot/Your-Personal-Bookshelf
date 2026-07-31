package com.yourbookshelf.yourbookshelf.service.ai;

import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import lombok.AllArgsConstructor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MyAIServiceTest {
    @Autowired
    private MyAIService service;

    @Test
    void generatePhrases() {
        //given
        String selectedText = """
                After the catastrophic failure of the artificial intelligence systems, human society was\s
                                relegated to huddling in isolated communities. Scholars were forced to bite the bullet\s
                                and rebuild their legacy from scratch. Even decades later, many historians still weep for the\s
                                future whenever they recall the sheer scale of the Butlerian insanity that brought civilization to its knees.""";
        String context = """
                Scholars were forced to bite the bullet and rebuild their legacy from scratch. 
                Even decades later, many historians still weep for the future whenever they recall 
                the sheer scale of the Butlerian insanity.
                """;

        String targetLang = "ru";

        //when
        List<SimplePhrase> result = service.generatePhrases(selectedText, targetLang, context);
        System.out.println("=== Сгенерированные фразы ===");
        result.forEach(it -> {
            System.out.printf("- %s -> %s%n", it.sourceText(), it.translation());
        });

        //then
        assertThat(result).isNotNull().isNotEmpty();
        SimplePhrase phrase = result.getFirst();
        assertThat(phrase.sourceText()).isNotBlank();
        assertThat(phrase.translation()).isNotBlank();


    }
}