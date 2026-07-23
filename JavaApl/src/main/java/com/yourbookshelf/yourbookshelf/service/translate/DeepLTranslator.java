package com.yourbookshelf.yourbookshelf.service.translate;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component("myDeepLTranslator")
public class DeepLTranslator implements MyTranslator {
    private static final String URI = "/v2/translate";
    private final RestClient restClient;

    public DeepLTranslator(@Qualifier("deepLRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record DeepLRequest(List<String> text,
                               @JsonProperty("target_lang")
                               String targetLanguage,
                               @JsonProperty("source_lang")
                               String contentLanguage
    ) {
    }

    public record DeepLResponse(List<Translation> translations) {
        public record Translation(
                @JsonProperty("detected_source_language")
                String detectedSourceLang,
                @JsonProperty("text")
                String text
        ) {
        }

    }

    @Override
    public String translate(String message, String targetLanguage, String contentLanguage) {
        DeepLRequest request = new DeepLRequest(
                List.of(message),
                targetLanguage.toUpperCase(),
                !contentLanguage.isBlank() ? contentLanguage.toUpperCase() : null
        );
        DeepLResponse response = restClient.post().uri(URI)
                .body(request)
                .retrieve()
                .body(DeepLResponse.class);

        if(response!=null&&response.translations()!=null&&!response.translations().isEmpty()){
            return response.translations().getFirst().text();
        }
        throw new RuntimeException("Empty response from DeepL API");
    }
}
