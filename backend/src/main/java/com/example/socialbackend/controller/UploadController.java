package com.example.socialbackend.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final Path root = Paths.get("uploads");

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String mediaTypeStr = null;
                try {
                    mediaTypeStr = java.nio.file.Files.probeContentType(file);
                } catch (Exception ignored) {}

                if (mediaTypeStr == null) {
                    String lower = filename.toLowerCase();
                    if (lower.endsWith(".mp4")) mediaTypeStr = "video/mp4";
                    else if (lower.endsWith(".webm")) mediaTypeStr = "video/webm";
                    else if (lower.endsWith(".mov")) mediaTypeStr = "video/quicktime";
                    else if (lower.endsWith(".avi")) mediaTypeStr = "video/x-msvideo";
                    else if (lower.endsWith(".mkv")) mediaTypeStr = "video/x-matroska";
                    else if (lower.endsWith(".png")) mediaTypeStr = "image/png";
                    else if (lower.endsWith(".webp")) mediaTypeStr = "image/webp";
                    else if (lower.endsWith(".gif")) mediaTypeStr = "image/gif";
                    else mediaTypeStr = "image/jpeg";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(mediaTypeStr))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}