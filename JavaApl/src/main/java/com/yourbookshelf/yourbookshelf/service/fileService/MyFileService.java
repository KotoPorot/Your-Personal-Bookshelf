package com.yourbookshelf.yourbookshelf.service.fileService;

import com.yourbookshelf.yourbookshelf.customException.MyIOException;
import com.yourbookshelf.yourbookshelf.customException.MyPathDoesNotExistException;
import com.yourbookshelf.yourbookshelf.customException.MyUserDoesNotHaveAcces;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class MyFileService {
    private final Path BOOK_STORAGE_LOCATION = Paths.get("JavaApl\\book_storage");
    private final Path COVER_IMAGE_STORAGE = Paths.get("JavaApl\\cover_image_storage");

    public void deleteFileFromStorage(String path) {
        if (path == null || path.isEmpty()) {
            return;
        }
        try {
            Files.deleteIfExists(Paths.get(path));
        } catch (IOException e) {
            System.out.println("Failed to delete file: " + path + ". Error: " + e.getMessage());
        }
    }

    public Path saveFile (InputStream stream, String fileName, Path rootLocation) throws IOException{
        if (!Files.exists(rootLocation)) {
            Files.createDirectories(rootLocation);
        }
        Path path = rootLocation.resolve(fileName);
        Files.copy(stream, path, StandardCopyOption.REPLACE_EXISTING);
        return path;
    }

    public Path validatePath(String path, Path storage){
        if (path == null || path.isEmpty()) {
            throw new MyPathDoesNotExistException("Path does not exist");
        }

        Path validPath = Paths.get(path).normalize();
        if (!validPath.startsWith(storage)) {
            throw new MyUserDoesNotHaveAcces("user cant read this file");
        }
        if(Files.notExists(validPath)){
            throw new MyIOException("file does not exist");
        }
        return validPath;
    }

    public Path getBOOK_STORAGE_LOCATION() {
        return BOOK_STORAGE_LOCATION;
    }

    public Path getCOVER_IMAGE_STORAGE() {
        return COVER_IMAGE_STORAGE;
    }
}
