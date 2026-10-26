package com.example.socialbackend.controller;

import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.socialbackend.service.FileStorageService;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;
    private final com.example.socialbackend.repository.PostRepository posts;
    private final com.example.socialbackend.service.UserService userService;
    private final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private FileStorageService fileStorageService;

    @Value("${app.debug:false}")
    private boolean debug;

    public UserController(UserRepository users, com.example.socialbackend.repository.PostRepository posts, com.example.socialbackend.service.UserService userService) { this.users = users; this.posts = posts; this.userService = userService; }


    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        logger.debug("UserController.get called for id={}", id);
        return users.findById(id).map(u -> {
            Map<String,Object> out = new HashMap<>();
            out.put("id", u.getId());
            out.put("name", u.getName());
            out.put("email", u.getEmail());
            out.put("bio", u.getBio());
            out.put("avatarColor", u.getAvatarColor());
            out.put("region", u.getRegion());
            out.put("role", u.getRole());
            out.put("isVerifiedExpert", u.isVerifiedExpert());
            // Add avatarUrl if present
            if (u.getAvatarUrl() != null) {
                out.put("avatarUrl", u.getAvatarUrl());
            }
            // Add coverUrl if present
            if (u.getCoverUrl() != null) {
                out.put("coverUrl", u.getCoverUrl());
            }
            // Add expert fields if user is expert
            if (u.getRole() == User.Role.EXPERT && u.isVerifiedExpert()) {
                var expertProfileOpt = userService.getExpertProfileByUserId(u.getId());
                if (expertProfileOpt.isPresent()) {
                    var profile = expertProfileOpt.get();
                    out.put("specialization", profile.getSpecialization());
                    out.put("cropExpertise", profile.getCropExpertise());
                    out.put("yearsOfExperience", profile.getYearsOfExperience());
                    out.put("region", profile.getRegion());
                    out.put("expertBio", profile.getBio());
                }
            }
            long followersCount = users.countFollowersById(u.getId());
            long followingCount = users.countFollowingById(u.getId());
            out.put("followersCount", followersCount);
            out.put("followingCount", followingCount);
            boolean isFollowing = false;
            if (authentication != null && authentication.getPrincipal() instanceof com.example.socialbackend.model.User) {
                com.example.socialbackend.model.User requester = (com.example.socialbackend.model.User) authentication.getPrincipal();
                isFollowing = users.existsFollower(u.getId(), requester.getId());
            }
            out.put("isFollowing", isFollowing);
            return ResponseEntity.ok(out);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- AVATAR/PROFILE PICTURE UPLOAD ENDPOINT ---
    @PostMapping(path = "/{id}/avatar", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestPart("file") MultipartFile file, Authentication authentication) {
        requireSelfOrAdmin(id, authentication);
        return users.findById(id).map(u -> {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
            }
            String url;
            try {
                url = fileStorageService.store(file);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("message", "Failed to store file: " + e.getMessage()));
            }
            try {
                u.setAvatarUrl(url);
                users.save(u);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("message", "Failed to update user: " + e.getMessage()));
            }
            Map<String,Object> out = new HashMap<>();
            out.put("id", u.getId());
            out.put("avatarUrl", url);
            out.put("message", "Avatar uploaded successfully");
            return ResponseEntity.ok(out);
        }).orElse(ResponseEntity.notFound().build());
    }


    @GetMapping
    public ResponseEntity<?> list() {
        // Normal user list (no password)
        return ResponseEntity.ok(users.findAll().stream().map(u -> {
            java.util.Map<String,Object> out = new java.util.HashMap<>();
            out.put("id", u.getId());
            out.put("name", u.getName());
            out.put("email", u.getEmail());
            out.put("bio", u.getBio());
            out.put("avatarColor", u.getAvatarColor());
            out.put("region", u.getRegion());
            out.put("role", u.getRole());
            out.put("isVerifiedExpert", u.isVerifiedExpert());
            out.put("followersCount", users.countFollowersById(u.getId()));
            out.put("followingCount", users.countFollowingById(u.getId()));
            return out;
        }).toList());
    }

    // DEBUG ONLY: List all users with password hashes
    @GetMapping("/debug/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> debugAll() {
        if (!debug) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(users.findAll().stream().map(u -> {
            java.util.Map<String,Object> out = new java.util.HashMap<>();
            out.put("id", u.getId());
            out.put("name", u.getName());
            out.put("email", u.getEmail());
            out.put("bio", u.getBio());
            out.put("avatarColor", u.getAvatarColor());
            out.put("region", u.getRegion());
            out.put("followersCount", users.countFollowersById(u.getId()));
            out.put("followingCount", users.countFollowingById(u.getId()));
            return out;
        }).toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String,String> body, Authentication authentication) {
        requireSelfOrAdmin(id, authentication);
        return users.findById(id).map(u -> {
            if (body.containsKey("name")) u.setName(body.get("name"));
            if (body.containsKey("bio")) u.setBio(body.get("bio"));
            if (body.containsKey("avatarColor")) u.setAvatarColor(body.get("avatarColor"));
            if (body.containsKey("region")) u.setRegion(body.get("region"));
            users.save(u);
            java.util.Map<String,Object> out = new java.util.HashMap<>();
            out.put("id", u.getId());
            out.put("name", u.getName());
            out.put("email", u.getEmail());
            out.put("bio", u.getBio());
            out.put("avatarColor", u.getAvatarColor());
            out.put("region", u.getRegion());
            out.put("followersCount", users.countFollowersById(u.getId()));
            out.put("followingCount", users.countFollowingById(u.getId()));
            return ResponseEntity.ok(out);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<?> posts(@PathVariable Long id) {
        logger.debug("UserController.posts called for id={}", id);
        return users.findById(id).map(u -> {
            java.util.List<java.util.Map<String,Object>> out = posts.findByAuthorOrderByCreatedAtDesc(u).stream().map(p -> {
                java.util.Map<String,Object> m = new java.util.HashMap<>();
                m.put("id", p.getId());
                m.put("createdAt", p.getCreatedAt());
                m.put("caption", p.getCaption());
                m.put("imageUrl", p.getImageUrl());
                m.put("content", p.getContent());
                m.put("authorId", p.getAuthor() == null ? null : p.getAuthor().getId());
                m.put("authorName", p.getAuthor() == null ? null : p.getAuthor().getName());
                java.util.List<Long> likes = p.getLikedBy() == null ? java.util.List.of() : p.getLikedBy().stream().map(liker -> liker.getId()).toList();
                m.put("likes", likes);
                m.put("comments", p.getComments() == null ? java.util.List.of() : p.getComments().stream().map(c -> {
                    java.util.Map<String,Object> cm = new java.util.HashMap<>();
                    cm.put("id", c.getId());
                    cm.put("text", c.getText());
                    cm.put("authorName", c.getAuthorName());
                    cm.put("createdAt", c.getCreatedAt() == null ? null : c.getCreatedAt().toString());
                    return cm;
                }).toList());
                return m;
            }).toList();
            return ResponseEntity.ok(out);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<?> follow(@PathVariable Long id) {
        userService.followUser(id);
        if (!users.existsById(id)) return ResponseEntity.notFound().build();
        long followersCount = users.countFollowersById(id);
        java.util.Map<String,Object> out = new java.util.HashMap<>();
        out.put("id", id);
        out.put("followersCount", followersCount);
        out.put("isFollowing", true);
        return ResponseEntity.ok(out);
    }

    @PostMapping("/{id}/unfollow")
    public ResponseEntity<?> unfollow(@PathVariable Long id) {
        userService.unfollowUser(id);
        if (!users.existsById(id)) return ResponseEntity.notFound().build();
        long followersCount = users.countFollowersById(id);
        java.util.Map<String,Object> out = new java.util.HashMap<>();
        out.put("id", id);
        out.put("followersCount", followersCount);
        out.put("isFollowing", false);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<?> followers(@PathVariable Long id) {
        if (!users.existsById(id)) return ResponseEntity.notFound().build();
        java.util.List<com.example.socialbackend.model.User> list = users.findFollowersByUserId(id);
        java.util.List<java.util.Map<String,Object>> out = list.stream().map(f -> {
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("id", f.getId()); m.put("name", f.getName()); m.put("avatarColor", f.getAvatarColor());
            return m;
        }).toList();
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<?> following(@PathVariable Long id) {
        if (!users.existsById(id)) return ResponseEntity.notFound().build();
        java.util.List<com.example.socialbackend.model.User> list = users.findFollowingByUserId(id);
        java.util.List<java.util.Map<String,Object>> out = list.stream().map(f -> {
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("id", f.getId()); m.put("name", f.getName()); m.put("avatarColor", f.getAvatarColor());
            return m;
        }).toList();
        return ResponseEntity.ok(out);
    }

    // --- COVER PHOTO UPLOAD ENDPOINT ---
    @PostMapping(path = "/{id}/cover", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadCover(@PathVariable Long id, @RequestPart("coverImage") MultipartFile coverImage, Authentication authentication) {
        requireSelfOrAdmin(id, authentication);
        return users.findById(id).map(u -> {
            if (coverImage == null || coverImage.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
            }
            String url;
            try {
                url = fileStorageService.store(coverImage);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("message", "Failed to store file: " + e.getMessage()));
            }
            // Save URL to user entity
            try {
                java.lang.reflect.Field coverField = u.getClass().getDeclaredField("coverUrl");
                coverField.setAccessible(true);
                coverField.set(u, url);
                users.save(u);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("message", "Failed to update user: " + e.getMessage()));
            }
            // Return updated user info (with coverUrl)
            java.util.Map<String,Object> out = new java.util.HashMap<>();
            out.put("id", u.getId());
            out.put("coverUrl", url);
            out.put("message", "Cover photo uploaded successfully");
            return ResponseEntity.ok(out);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void requireSelfOrAdmin(Long targetUserId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        User me = (User) authentication.getPrincipal();
        boolean isAdmin = me.getRole() == User.Role.ADMIN;
        if (!isAdmin && !me.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }
    }
}
