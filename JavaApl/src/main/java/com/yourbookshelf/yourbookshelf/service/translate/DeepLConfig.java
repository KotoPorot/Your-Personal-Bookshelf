package com.yourbookshelf.yourbookshelf.service.translate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class DeepLConfig {
    @Value("${deepl.base-url}")
    private String baseUrl;
    @Value("${deepl.api-key}")
    private String apiKey;

    @Bean("deepLRestClient")
    public RestClient deepLRestClient(){
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "DeepL-Auth-Key " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
