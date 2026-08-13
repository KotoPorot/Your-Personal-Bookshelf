package com.yourbookshelf.yourbookshelf.service.ai;

import com.yourbookshelf.yourbookshelf.DTO.ai.MyExampleDTO;
import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MyAIServiceTest {
    @Autowired
    private MyAIService service;

    private record SelectedTextRequest(String selectedText, String context, String targetLang) {
    }

    private record TestSimpleRequest(String text, String targetLang) {
    }
    private record TestRegenerateRequest(@NotBlank String phrase,
                                    @NotBlank String targetLang,
                                    @NotBlank String oldValue) {
    }

    private static Stream<SelectedTextRequest> generatePhraseRequests() {
        return Stream.of(new SelectedTextRequest("fading glow", "As she watched the fading glow of debris on the screen, Cioba whispered, “I thought you said that ship didn’t pose a threat to us.", "RU"), new SelectedTextRequest("I have no doubt of that", "I have no doubt of that,” Josef said. “But increased prices are not what I require. For the good of humanity, this barbarian nonsense has to stop—and it will only stop when planets like Baridge choose civilization and commerce over fanaticism.” He crossed his arms over his chest. “This is not a negotiating ploy, Deacon. It is my only offer.", "uk-UA"), new SelectedTextRequest("terminated", "Cioba terminated the transmission. Josef flared his nostrils, shaking his head and trying to calm himself.", "ru"), new SelectedTextRequest("spurred", "The sudden rise in interest rates spurred a wave of panic selling across global stock markets.", "uk-UA"), new SelectedTextRequest("take it with a grain of salt", "You should take his advice with a grain of salt because he always exaggerates his success.", "ru"), new SelectedTextRequest("came across", "While sorting through the old boxes in the attic, she came across a dusty photo album from 1990.", "RU"), new SelectedTextRequest("address", "The CEO promised to address the environmental concerns raised by local residents during tomorrow's town hall.", "ru"), new SelectedTextRequest("at the expense of", "The company achieved rapid quarterly growth at the expense of long-term employee stability.", "uk-UA"));
    }

    private static Stream<TestSimpleRequest> generateExampleRequests() {
        return Stream.of(new TestSimpleRequest("fading glow", "ru"), new TestSimpleRequest("sein der Hammer", "ru"), new TestSimpleRequest("have no doubt of", "ru"), new TestSimpleRequest("terminated", "uk-UA"), new TestSimpleRequest("spurred a wave", "ru"), new TestSimpleRequest("take with a grain of salt", "uk-UA"));
    }

    private static Stream<TestRegenerateRequest> regenerateExampleRequests(){
        return Stream.of(
                new TestRegenerateRequest(
                        "take with a grain of salt",
                        "ru",
                        "You should take his advice with a grain of salt because he exaggerates."
                ),
                new TestRegenerateRequest(
                        "bite the bullet",
                        "uk-UA",
                        "He decided to bite the bullet and discuss the problem with his manager."
                ),
                new TestRegenerateRequest(
                        "sein der Hammer",
                        "ru",
                        "Das neue Album dieser Band ist einfach der Hammer!"
                ),
                new TestRegenerateRequest(
                        "terminated",
                        "ru",
                        "The company terminated his employment contract yesterday morning."
                ),
                new TestRegenerateRequest(
                        "fading glow",
                        "uk-UA",
                        "We sat on the beach and watched the fading glow of the sun."
                )
                );
    }

    private static Stream<TestRegenerateRequest> regenerateDefinitionRequests(){
        return Stream.of(
                new TestRegenerateRequest(
                        "get promoted",
                        "ru",
                        "receive a higher position or a better job at work"
                ),
                new TestRegenerateRequest(
                        "bite the bullet",
                        "ru",
                        "force yourself to do something difficult or unpleasant"
                ),
                new TestRegenerateRequest(
                        "sein der Hammer",
                        "ru",
                        "sehr gut, toll oder beeindruckend sein"
                ),
                new TestRegenerateRequest(
                        "take a rain check",
                        "uk-UA",
                        "politely refuse an offer now, but promise to accept it later"
                ),
                new TestRegenerateRequest(
                        "address",
                        "ru",
                        "think about a problem and try to find a solution"
                )
        );
    }


    @ParameterizedTest
    @MethodSource("generatePhraseRequests")
    void generatePhrasesTESTPROMPT(SelectedTextRequest request) {

        List<SimplePhrase> phrases = service.generatePhrases(request.selectedText(), request.targetLang(), request.context());
        phrases.forEach(phrase -> {
            System.out.printf("- %s -> %s%n", phrase.sourceText(), phrase.translation());
        });

        assertThat(phrases).isNotEmpty();
        assertThat(phrases).allSatisfy(phrase -> {
            assertThat(phrase.sourceText()).isNotBlank();
            assertThat(phrase.translation()).isNotBlank();
        });
    }

    @ParameterizedTest
    @MethodSource("generateExampleRequests")
    void generateExamples(TestSimpleRequest request) {
        //given
        PromptTemplate template = MyPrompts.GENERATE_EXAMPLE.toPromptTemplate();

        //when
        List<MyExampleDTO> examples = service.generateExamples(request.text(), request.targetLang(), template);

        examples.forEach(it -> {
            System.out.println(it.example());
            System.out.println(it.translation());
            System.out.println(it.withoutTargetWord());
        });

        //then
        assertThat(examples).isNotEmpty();
        assertThat(examples).allSatisfy(it -> {
            assertThat(it.example()).isNotBlank();
            assertThat(it.translation()).isNotBlank();
            assertThat(it.withoutTargetWord()).contains("___");
        });
    }

    @ParameterizedTest
    @MethodSource("generateExampleRequests")
    void generateDefinition(TestSimpleRequest request) {
        PromptTemplate template = MyPrompts.GENERATE_DEFINITION.toPromptTemplate();

        //when
        String result = service.generateDefinition(request.text(), request.targetLang(),
                template);

        System.out.println("phrase: " + request.text());
        System.out.println("definition: " + result);

        //then
        assertThat(result).isNotBlank();
    }

    @ParameterizedTest
    @MethodSource("regenerateExampleRequests")
    void regenerateExample(TestRegenerateRequest request) {

        //when
        MyExampleDTO example = service.regenerateExample(request.phrase(), request.targetLang(),
                request.oldValue(), MyPrompts.REGENERATE_EXAMPLE.toPromptTemplate());

        System.out.println("phrase: " + request.phrase());
        System.out.println("old Value: " + request.oldValue());
        System.out.println("new value: " + example.example());
        System.out.println("new translation: " + example.translation());
        System.out.println("new without target world: " + example.withoutTargetWord())


        ;
        //then
        assertThat(example.example()).isNotBlank();
        assertThat(example.translation()).isNotBlank();
        assertThat(example.withoutTargetWord()).contains("___");

    }

    @ParameterizedTest
    @MethodSource("regenerateDefinitionRequests")
    void regenerateDefinition(TestRegenerateRequest request) {

        String definition = service.regenerateDefinition(request.phrase(), request.targetLang(),
                request.oldValue(), MyPrompts.REGENERATE_DEFINITION.toPromptTemplate());

        System.out.println("phrase: " + request.phrase());
        System.out.println("old Value: " + request.oldValue());
        System.out.println("new definition: " + definition);

        assertThat(definition).isNotBlank();
    }
}































