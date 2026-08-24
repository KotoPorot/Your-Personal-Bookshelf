package com.yourbookshelf.yourbookshelf.DTO.book;

import org.springframework.core.io.Resource;

public record MyBookResourceDTO(
        Resource resource, String contentType, String fileName
) {
}
