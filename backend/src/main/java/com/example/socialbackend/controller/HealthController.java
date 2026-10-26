package com.example.socialbackend.controller;

import com.example.socialbackend.repository.UserRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;



@RestController
@RequestMapping("/api/health")
@ConditionalOnProperty(name = "app.debug", havingValue = "true")
public class HealthController {

    private final UserRepository users;

    @Value("${app.debug:false}")
    private boolean debug;

    public HealthController(UserRepository users) { this.users = users; }

    @GetMapping("")
    public ResponseEntity<?> health() {
        try {
            long count = users.count();
            java.util.Map<String,Object> ok = new java.util.HashMap<>(); ok.put("db", "ok"); ok.put("users", count); ok.put("debug", debug); return ResponseEntity.ok(ok);
        } catch (Exception e) {
            java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("db", "error"); err.put("message", e.getMessage()); err.put("debug", debug); return ResponseEntity.status(503).body(err);
        }
    }
}