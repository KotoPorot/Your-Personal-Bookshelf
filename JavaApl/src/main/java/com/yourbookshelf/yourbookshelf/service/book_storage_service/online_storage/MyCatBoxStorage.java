package com.yourbookshelf.yourbookshelf.service.book_storage_service.online_storage;

import com.yourbookshelf.yourbookshelf.DTO.book.MyBookMetadata;
import com.yourbookshelf.yourbookshelf.DTO.book.MyBookResourceDTO;
import com.yourbookshelf.yourbookshelf.customException.MyBookAlreadyExistsOnShelfException;
import com.yourbookshelf.yourbookshelf.customException.MyIOException;
import com.yourbookshelf.yourbookshelf.entity.MyBook;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.mapper.DtoMapper;
import com.yourbookshelf.yourbookshelf.service.book_storage_service.MyBookStorage;
import com.yourbookshelf.yourbookshelf.service.entity_service.MyShelfService;
import com.yourbookshelf.yourbookshelf.service.parser.EpubService;
import nl.siegmann.epublib.domain.Book;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component("myCatBoxStorage")
public class MyCatBoxStorage implements MyBookStorage {
    private final DtoMapper mapper;
    private final MyShelfService shelfService;
    private final EpubService epubService;
    private final RestClient restClient;

    @Value("${catbox.userhash}")
    private String userhash;

    public MyCatBoxStorage(DtoMapper mapper, MyShelfService shelfService, EpubService epubService, RestClient catboxRestClient) {
        this.mapper = mapper;
        this.shelfService = shelfService;
        this.epubService = epubService;
        this.restClient = catboxRestClient;
    }

    @Override
    public MyBook addBook(MultipartFile file, MyShelf shelf) {
        try {
            Book book = epubService.getBook(file.getInputStream());
            MyBookMetadata metadata = epubService.extractMetadata(book);
            MyBook myBook = mapper.extractMetadataToMyBook(metadata);

            if (shelfService.isShelfHasBook(shelf, metadata.getTitle())) {
                throw new MyBookAlreadyExistsOnShelfException("you have already uploaded this book: " + book.getMetadata().getFirstTitle());
            }

            String uuid = UUID.randomUUID().toString();

            Resource bookResource = file.getResource();

            String filePath = saveFile(bookResource.getContentAsByteArray(), uuid + ".epub");
            myBook.setFilePath(filePath);

            if (book.getCoverImage() != null) {
                String imgFormat = epubService.getImageFormat(book.getCoverImage().getMediaType().toString());
                String coverImagePath = saveFile(book.getCoverImage().getData(), uuid + imgFormat);
                myBook.setCoverPath(coverImagePath);
            }
            myBook.setShelf(shelf);
            return myBook;

        } catch (IOException e) {
            throw new MyIOException(e.getMessage());
        }

    }


    @Override
    public MyBookResourceDTO getCoverImage(MyBook book) {
        Resource coverImg = downloadResource(book.getCoverPath());
        String contentType = book.getCoverPath().endsWith(".png") ? MediaType.IMAGE_PNG_VALUE : MediaType.IMAGE_JPEG_VALUE;
        String fileName = extractFileName(book.getCoverPath());
        return new MyBookResourceDTO(coverImg, contentType, fileName);
    }

    @Override
    public boolean deleteBook(MyBook book) {

        List<String> filesToDelete = new ArrayList<>();

        String bookFileName = extractFileName(book.getFilePath());
        if (!bookFileName.isEmpty()) {
            filesToDelete.add(bookFileName);
        }
        String coverImgName = extractFileName(book.getCoverPath());
        if (!coverImgName.isEmpty()) {
            filesToDelete.add(coverImgName);
        }

        String fileNames = String.join(" ", filesToDelete);


        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("reqtype", "deletefiles");
        if (userhash != null && !userhash.isBlank()) {
            body.add("userhash", userhash);
        }
        body.add("files", fileNames.toString());

        restClient.post().uri("/user/api.php").contentType(MediaType.APPLICATION_FORM_URLENCODED).body(body).retrieve().toBodilessEntity();

        return true;
    }

    @Override
    public MyBookResourceDTO getFileBook(MyBook book) {
        Resource downloadedResource = downloadResource(book.getFilePath());
        String contentType = "application/epub+zip";
        String fileName = extractFileName(book.getFilePath());
        return new MyBookResourceDTO(downloadedResource, contentType, fileName);
    }

    private String saveFile(byte[] bytes, String fileName) {
        ByteArrayResource resource = new ByteArrayResource(bytes) {
            @Override
            public @Nullable String getFilename() {
                return fileName;
            }
        };
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("reqtype", "fileupload");
        if (userhash != null && !userhash.isBlank()) {
            body.add("userhash", userhash);
        }
        body.add("fileToUpload", resource);

        return restClient.post().uri("/user/api.php").contentType(MediaType.MULTIPART_FORM_DATA).body(body).retrieve().body(String.class);
    }

    private ByteArrayResource downloadResource(String fileUrl) {
        byte[] bytes = restClient.get().uri(URI.create(fileUrl)).retrieve().body(byte[].class);
        if (bytes == null) {
            throw new RuntimeException("can't download by link: " + fileUrl);
        }
        return new ByteArrayResource(bytes);
    }

    private String extractFileName(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        try {
            URI uri = new URI(path);
            return Path.of(uri.getPath()).getFileName().toString();
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }
}
