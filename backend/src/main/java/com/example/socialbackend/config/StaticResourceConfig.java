package com.example.socialbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final String uploadDir;

    public StaticResourceConfig(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path p = Path.of(uploadDir).toAbsolutePath().normalize();
        String location = "file:" + p.toString() + "/";
        // Serve uploads at both /uploads/** and /api/uploads/** so dev proxy (Vite) can fetch images
        registry.addResourceHandler("/" + uploadDir + "/**").addResourceLocations(location);
        registry.addResourceHandler("/api/" + uploadDir + "/**").addResourceLocations(location);
    }
}
