package com.example.socialbackend.controller;

import com.example.socialbackend.model.Scheme;
import com.example.socialbackend.model.User;
import com.example.socialbackend.model.UserSchemeTracker;
import com.example.socialbackend.repository.SchemeRepository;
import com.example.socialbackend.repository.UserSchemeTrackerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/schemes")
public class SchemeController {

    private final SchemeRepository schemeRepository;
    private final UserSchemeTrackerRepository trackerRepository;

    public SchemeController(SchemeRepository schemeRepository,
                            UserSchemeTrackerRepository trackerRepository) {
        this.schemeRepository = schemeRepository;
        this.trackerRepository = trackerRepository;
    }

    @GetMapping
    public ResponseEntity<List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(schemeRepository.findAll());
    }

    @GetMapping("/tracked")
    public ResponseEntity<?> getMyTrackedSchemes(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = (User) authentication.getPrincipal();
        List<UserSchemeTracker> trackedList = trackerRepository.findByUserOrderByUpdatedAtDesc(user);
        
        List<Map<String, Object>> result = trackedList.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("schemeId", t.getScheme().getId());
            map.put("schemeTitle", t.getScheme().getTitle());
            map.put("schemeTitleMr", t.getScheme().getTitleMr());
            map.put("subsidyAmount", t.getScheme().getSubsidyAmount());
            map.put("portalUrl", t.getScheme().getPortalUrl());
            map.put("status", t.getStatus());
            map.put("applicationNumber", t.getApplicationNumber());
            map.put("notes", t.getNotes());
            map.put("updatedAt", t.getUpdatedAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/track")
    public ResponseEntity<?> trackScheme(Authentication authentication,
                                         @PathVariable Long id,
                                         @RequestBody Map<String, String> body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = (User) authentication.getPrincipal();
        Scheme scheme = schemeRepository.findById(id).orElse(null);
        if (scheme == null) {
            return ResponseEntity.notFound().build();
        }

        String status = body.getOrDefault("status", "INTERESTED");
        String appNum = body.get("applicationNumber");
        String notes = body.get("notes");

        UserSchemeTracker tracker = trackerRepository.findByUserAndScheme(user, scheme)
                .orElseGet(() -> {
                    UserSchemeTracker t = new UserSchemeTracker();
                    t.setUser(user);
                    t.setScheme(scheme);
                    return t;
                });

        tracker.setStatus(status);
        if (appNum != null) tracker.setApplicationNumber(appNum);
        if (notes != null) tracker.setNotes(notes);
        tracker.setUpdatedAt(Instant.now());

        trackerRepository.save(tracker);

        return ResponseEntity.ok(Map.of("message", "Scheme track status updated successfully", "status", status));
    }

    @PostMapping
    public ResponseEntity<Scheme> createScheme(@RequestBody Scheme scheme) {
        if (scheme.getCreatedAt() == null) {
            scheme.setCreatedAt(Instant.now());
        }
        Scheme saved = schemeRepository.save(scheme);
        return ResponseEntity.ok(saved);
    }
}
