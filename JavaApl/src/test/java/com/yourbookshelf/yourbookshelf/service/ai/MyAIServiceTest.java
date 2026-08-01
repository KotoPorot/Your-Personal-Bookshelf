package com.yourbookshelf.yourbookshelf.service.ai;

import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MyAIServiceTest {
    @Autowired
    private MyAIService service;

    private record Request(String selectedText,
                           String context,
                           String targetLang) {
    }

    static List<Request> requests = new ArrayList<>();

    @BeforeAll
    static void setUp() {
        requests.addAll(List.of(
                new Request("fading glow",
                        "As she watched the fading glow of debris on the screen, Cioba whispered, “I thought you said that ship didn’t pose a threat to us.",
                        "RU"),
                new Request("I have no doubt of that",
                        "I have no doubt of that,” Josef said. “But increased prices are not what I require. For the good of humanity, this barbarian nonsense has to stop—and it will only stop when planets like Baridge choose civilization and commerce over fanaticism.” He crossed his arms over his chest. “This is not a negotiating ploy, Deacon. It is my only offer.",
                        "uk-UA"),
                new Request("terminated",
                        "Cioba terminated the transmission. Josef flared his nostrils, shaking his head and trying to calm himself.",
                        "ru"),
                new Request("spurred",
                        "The sudden rise in interest rates spurred a wave of panic selling across global stock markets.",
                        "uk-UA"),
                new Request("take it with a grain of salt",
                        "You should take his advice with a grain of salt because he always exaggerates his success.",
                        "ru"),
                new Request("came across",
                        "While sorting through the old boxes in the attic, she came across a dusty photo album from 1990.",
                        "RU"),
                new Request("address",
                        "The CEO promised to address the environmental concerns raised by local residents during tomorrow's town hall.",
                        "ru"),
                new Request("at the expense of",
                        "The company achieved rapid quarterly growth at the expense of long-term employee stability.",
                        "uk-UA")
        ));
    }

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

    @Test
    void generatePhrasesTESTPROMPT() {
        //given
        PromptTemplate template = new PromptTemplate("""
    Ты — языковой ассистент. Твоя задача — проанализировать текст, выделенный пользователем, и подготовить список фраз для изучния.
    Целевой язык перевода: {targetLang}.

    ### ВХОДНЫЕ ДАННЫЕ:
    - Выделенный текст: "{selectedText}"
    - Контекст вокруг текста: "{context}"

    ### ПРАВИЛА ФОРМИРОВАНИЯ СТРУКТУРЫ (ОБЯЗАТЕЛЬНО):

    1. ЗАПИСЬ №1 (Всегда ровно одна):
       - Переведи "{selectedText}" целиком. Используй "Контекст" только для того, чтобы правильно понять значение.
       - Эта запись НЕ предназначена для отдельной карточки, это общий перевод выделенного.

    2. ЗАПИСИ №2 И ДАЛЕЕ (От 1 до 4 карточек):
       - Выделяй полезные слова, идиомы и устойчивые выражения **СТРОГО ИЗ "{selectedText}"**.
       - **ВАЖНО (Одиночные слова)**: Если в "{selectedText}" выделено всего 1 слово, обязательно создай для него карточку во 2-й записи (при необходимости дополни его 1-2 словами из "Контекста", чтобы получилась полноценная фраза).
       - **СТРОГИЙ ЗАПРЕТ**: Не вытягивай сторонние фразы из "Контекста", если они не входят в "{selectedText}". Контекст нужен только для передачи точного смысла.

    ### ПРАВИЛА ПЕРЕВОДА И ОФОРМЛЕНИЯ:
    - Пояснения в скобках **РАЗРЕШЕНЫ**, если они помогают понять оттенок значения, контекст применения или эмоцию (например: "(о сигнале)", "(книжное)", "(признак гнева)").
    - Возвращай результат **ТОЛЬКО в формате JSON array**, без вводных слов и Markdown-тегов.
    - Ответ должен быть на {targetLang}.

    ### ФОРМАТ JSON:
    {format}
    """);
        //when

        for (int i = 0; i < requests.size(); i++) {
            Request it = requests.get(i);
            List<SimplePhrase> phrases = service.generatePhrasesTESTPROMPT(it.selectedText(),
                    it.targetLang(), it.context(), template);

            System.out.println("=== Generated phrases for request num: " + i + " ===");
            System.out.println("selected text: " + it.selectedText());
            System.out.println("context: " + it.context());
            phrases.forEach(phrase -> {
                        System.out.printf("- %s -> %s%n", phrase.sourceText(), phrase.translation());
                    }
            );
        }


    }
}