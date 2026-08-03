package com.yourbookshelf.yourbookshelf.controller;

import com.yourbookshelf.yourbookshelf.DTO.ai.SimpleExample;
import com.yourbookshelf.yourbookshelf.DTO.ai.SimplePhrase;
import com.yourbookshelf.yourbookshelf.service.ai.MyAIService;
import com.yourbookshelf.yourbookshelf.service.ai.MyPrompts;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/ai")
public class AIRequestsController {
    private final MyAIService aiService;

    public record PhraseRequest (@NotBlank String selectedText,
                                 @NotBlank String targetLang,
                                 String context){}

    @PostMapping("/phrases")
    public ResponseEntity<List<SimplePhrase>> generatePhrases (@Valid @RequestBody PhraseRequest request){
        List<SimplePhrase> phrases = aiService.generatePhrases (request.selectedText(), request.targetLang(),
                request.context());
        return ResponseEntity.ok(phrases);
    }

    public record SimpleRequest(@NotBlank String text,
                                @NotBlank String targetLang){}


    @PostMapping("/examples")
    public ResponseEntity<List<SimpleExample>> generateExamples (@Valid @RequestBody SimpleRequest request){

        return ResponseEntity.ok(aiService.generateExamples(request.text(), request.targetLang(),
                MyPrompts.GENERATE_EXAMPLE.toPromptTemplate()));
    }


    public record MyDefinition(@NotBlank String defenition){}

    //TODO
    @PostMapping("/definition")
    public ResponseEntity<MyDefinition> generateDefinition(@Valid @RequestBody SimpleRequest request){
        return ResponseEntity.ok().build();
    }

    //TODO
    @PostMapping("regenerate-example")
    public ResponseEntity<SimpleExample> regenerateExample (@Valid @RequestBody SimpleRequest request){
        return ResponseEntity.ok().build();
    }

    //TODO
    @PostMapping("regenerate-definition")
    public ResponseEntity<MyDefinition> regenerateDefinition (@Valid @RequestBody SimpleRequest request){
        return ResponseEntity.ok().build();
    }
}
