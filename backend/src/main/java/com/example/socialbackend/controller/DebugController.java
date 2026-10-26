package com.example.socialbackend.controller;

import com.example.socialbackend.repository.UserRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
@ConditionalOnProperty(name = "app.debug", havingValue = "true")
public class DebugController {

    private final UserRepository users;

    public DebugController(UserRepository users) { this.users = users; }

    @GetMapping("/users")
    public ResponseEntity<?> users() {
        List<Map<String, Object>> out = users.findAll().stream().map(u -> {
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }
}