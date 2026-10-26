package com.example.socialbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    private final Path uploadDir;
    private final long maxFileSize;
    private final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private static final java.util.Set<String> ALLOWED_EXTENSIONS = java.util.Set.of(
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
        ".mp4", ".webm", ".mov", ".avi", ".mkv", ".3gp", ".ogg"
    );

    public FileStorageService(@Value("${app.upload.dir:uploads}") String dir,
                              @Value("${app.upload.max-size:104857600}") long maxFileSize) {
        this.uploadDir = Path.of(dir).toAbsolutePath().normalize();
        this.maxFileSize = maxFileSize;

        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String store(MultipartFile file) {
        validate(file);
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = getExtension(original).toLowerCase();
        String filename = UUID.randomUUID().toString() + ext;
        Path target = uploadDir.resolve(filename);

        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            logger.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file", e);
        }

        // Return URL path relative to server root. Prefix with /api so Vite dev server proxies it to the backend.
        return "/api/" + uploadDir.getFileName().toString() + "/" + filename;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() <= 0 || file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size (100MB)");
        }

        String name = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = getExtension(name).toLowerCase();
        String contentType = file.getContentType();
        boolean validExt = ALLOWED_EXTENSIONS.contains(ext);
        boolean validMime = contentType != null && (contentType.startsWith("image/") || contentType.startsWith("video/"));

        if (!validExt && !validMime) {
            throw new IllegalArgumentException("Invalid file type. Supported formats: JPG, PNG, WEBP, MP4, WEBM, MOV, AVI, MKV");
        }
    }

    private String getExtension(String name) {
        int idx = name.lastIndexOf('.');
        return idx == -1 ? "" : name.substring(idx);
    }
}
