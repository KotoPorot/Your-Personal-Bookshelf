package com.yourbookshelf.yourbookshelf.service.ai;


import org.springframework.ai.chat.prompt.PromptTemplate;

public enum MyPrompts {
    GENERATE_PHRASES ("""
            Ты — языковой ассистент, и помогаешь в изучении языка. Твоя задача выделить то,
             что человеку стоит выучить, какие фразы будут полезны.                        
                    Целевой язык: {targetLang}                    
                    Выделенный пользователем текст: {selectedText}
                    Контекст (вокруг выделеного пользователем): {context}
            
                     Ответь строго в формате массива фраз. Если выделенный человеком текст это конкретная фраза,
                     которая не требует контекста, тогда фразы из контекста использовать не нужно. Твоя задача:
                     проанализировать выделенный текст, и дать перевод, целиком выделеному тексту (если выделенный текст не 
                     передает смысл, тогда дополнить из контекста). Это всегда 1 запись в массиве фраз. Остальные записи 
                     это пары фраза + перевод. В переводе, можешь дописывать заметки, если они помогут в понимании фразы.
            """);

    private final String template;


    MyPrompts(String template) {
        this.template = template;
    }
    public String getTemplate() {
        return template;
    }

    public PromptTemplate toPromptTemplate(){
        return new PromptTemplate(this.template);
    }
}
