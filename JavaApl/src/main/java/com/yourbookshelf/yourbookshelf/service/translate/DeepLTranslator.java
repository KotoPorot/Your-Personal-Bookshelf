package com.yourbookshelf.yourbookshelf.service.translate;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.yourbookshelf.yourbookshelf.domain.MyLanguage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component("myDeepLTranslator")
public class DeepLTranslator implements MyTranslator<MyLanguage> {
    private static final String URI_TRANSLATE = "/v3/translate";
    private static final String URI_LANGUAGES = "/v3/languages";
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
                contentLanguage != null && !contentLanguage.isBlank() ? contentLanguage.toUpperCase() : null
        );
        DeepLResponse response = restClient.post().uri(URI_TRANSLATE)
                .body(request)
                .retrieve()
                .body(DeepLResponse.class);

        if (response != null && response.translations() != null && !response.translations().isEmpty()) {
            return response.translations().getFirst().text();
        }
        throw new RuntimeException("Empty response from DeepL API");
    }


    public record DeepLLang(
            @JsonProperty("lang") String lang,
            @JsonProperty("name") String name,
            @JsonProperty("usable_as_source") Boolean usableAsSource,
            @JsonProperty("usable_as_target") Boolean usableAsTarget
    ) {
    }

    @Override
    public List<MyLanguage> getLanguages() {

        List<DeepLLang> languages = restClient.get().uri(uriBuilder -> uriBuilder.
                        path(URI_LANGUAGES).
                        queryParam("resource", "translate_text").
                        build())
                .retrieve().body(new ParameterizedTypeReference<List<DeepLLang>>() {
                });

        return languages.stream().map(this::toMyLanguage).toList();
    }

    private MyLanguage toMyLanguage(DeepLLang dto) {
        MyLanguage lang = new MyLanguage();
        lang.setLang(dto.lang());
        lang.setName(dto.name());
        lang.setUsableAsSource(dto.usableAsSource());
        lang.setUsableAsTarget(dto.usableAsTarget());
        return lang;
    }
}
