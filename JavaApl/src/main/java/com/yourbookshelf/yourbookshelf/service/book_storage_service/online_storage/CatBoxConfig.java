package com.yourbookshelf.yourbookshelf.service.book_storage_service.online_storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class CatBoxConfig {
    @Value("${catbox.base-url}")
    private String apiUrl;

    @Bean
    public RestClient catboxRestClient(){

        return RestClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

}
