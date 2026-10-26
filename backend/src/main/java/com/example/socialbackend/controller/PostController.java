package com.example.socialbackend.controller;

import com.example.socialbackend.model.Comment;
import com.example.socialbackend.model.Post;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.PostRepository;
import com.example.socialbackend.repository.UserRepository;
import com.example.socialbackend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Comparator;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostRepository posts;
    private final UserRepository users;
    private final PostService postService;
    private final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PostController.class);

    public PostController(PostRepository posts, UserRepository users, PostService postService) {
        this.posts = posts; this.users = users; this.postService = postService; }

    @GetMapping
    public List<Map<String, Object>> all(@RequestParam(required = false) Long authorId) {
        if (authorId != null) {
            User u = users.findById(authorId).orElseThrow();
            return posts.findByAuthorOrderByCreatedAtDesc(u).stream().map(this::toDto).toList();
        }
        return posts.findAll().stream()
            .sorted(Comparator.comparing(Post::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .map(this::toDto)
            .toList();
    }

    @PostMapping
    public ResponseEntity<?> createPost(org.springframework.security.core.Authentication authentication,
                                        jakarta.servlet.http.HttpServletRequest request,
                                        @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
                                        @RequestParam(value = "caption", required = false) String caption) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("error","Unauthorized");
            return ResponseEntity.status(401).body(err);
        }
        User u = (User) authentication.getPrincipal();

        boolean isMultipart = request.getContentType() != null && request.getContentType().toLowerCase().startsWith("multipart/");
        try {
            logger.debug("createPost called isMultipart={} filePresent={} caption={}", isMultipart, (file != null && !file.isEmpty()), caption);
            Post created;
            if (isMultipart) {
                // multipart form: file (optional), caption (optional)
                created = postService.createPost(u.getId(), caption, file);
            } else {
                // JSON: parse request body manually to avoid message-converter issues with multipart content-types
                String json = request.getReader().lines().collect(java.util.stream.Collectors.joining("\n"));
                String content = null;
                if (json != null && !json.isBlank()) {
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        java.util.Map<String, String> parsed = mapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String,String>>(){});
                        content = parsed == null ? null : parsed.get("content");
                    } catch (com.fasterxml.jackson.core.JsonProcessingException jex) {
                        logger.warn("Invalid JSON in createPost request", jex);
                        java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", "Invalid JSON");
                        return ResponseEntity.badRequest().body(m);
                    }
                }
                created = postService.createPost(u.getId(), content, null);
            }
            logger.info("Post created id={} authorId={}", created.getId(), created.getAuthor() == null ? null : created.getAuthor().getId());
            return ResponseEntity.ok(toDto(created));
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", ex.getReason());
            logger.warn("createPost failed: status={} reason={}", ex.getStatusCode(), ex.getReason());
            return ResponseEntity.status(ex.getStatusCode()).body(m);
        } catch (Exception ex) {
            logger.error("Unhandled error in createPost", ex);
            java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", "Internal server error");
            return ResponseEntity.status(500).body(m);
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> like(org.springframework.security.core.Authentication authentication, @PathVariable Long id) {
        logger.debug("Like requested for postId={} authPresent={}", id, authentication != null && authentication.getPrincipal() instanceof User);
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(err);
        }
        User u = (User) authentication.getPrincipal();
        logger.debug("Dispatching like operation to service for postId={} userId={}", id, u.getId());
        try {
            Post updated = postService.toggleLike(id, u.getId());
            return ResponseEntity.ok(toDto(updated));
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            if (ex.getStatusCode() == org.springframework.http.HttpStatus.CONFLICT) {
                // Concurrent insert/remove conflict — return latest state instead of an error
                Post latest = posts.findById(id).orElseThrow();
                return ResponseEntity.ok(toDto(latest));
            }
            java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", ex.getReason());
            return ResponseEntity.status(ex.getStatusCode()).body(m);
        }
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> comment(org.springframework.security.core.Authentication authentication, @PathVariable Long id, @RequestBody Map<String,String> body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) { java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("error","Unauthorized"); return ResponseEntity.status(401).body(err); }
        User u = (User) authentication.getPrincipal();
        Post p = posts.findById(id).orElseThrow();
        if (p.getComments() == null) p.setComments(new java.util.ArrayList<>());
        Comment c = new Comment();
        c.setText(body.get("text"));
        c.setAuthorName(u.getName());
        c.setCreatedAt(Instant.now());
        c.setPost(p);
        p.getComments().add(c);
        posts.save(p);
        java.util.Map<String,Object> cmOut = new java.util.HashMap<>();
        cmOut.put("id", c.getId());
        cmOut.put("text", c.getText());
        cmOut.put("authorName", c.getAuthorName());
        cmOut.put("createdAt", c.getCreatedAt() == null ? null : c.getCreatedAt().toString());
        return ResponseEntity.ok(cmOut);
    }

    @PostMapping(value = "/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createImagePost(org.springframework.security.core.Authentication authentication,
                                             @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
                                             @RequestParam(value = "caption", required = false) String caption) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("error","Unauthorized");
            return ResponseEntity.status(401).body(err);
        }
        User u = (User) authentication.getPrincipal();
        try {
            Post created = postService.createImagePost(file, caption, u.getId());
            return ResponseEntity.ok(toDto(created));
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", ex.getReason());
            return ResponseEntity.status(ex.getStatusCode()).body(m);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(org.springframework.security.core.Authentication authentication, @PathVariable Long id, @RequestBody Map<String, String> body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) { java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("error","Unauthorized"); return ResponseEntity.status(401).body(err); }
        User u = (User) authentication.getPrincipal();
        Post p = posts.findById(id).orElseThrow();
        if (!p.getAuthor().getId().equals(u.getId())) { java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", "Forbidden"); return ResponseEntity.status(403).body(m); }
        if (body.containsKey("content")) p.setContent(body.get("content"));
        posts.save(p);
        return ResponseEntity.ok(toDto(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(org.springframework.security.core.Authentication authentication, @PathVariable Long id) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) { java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("error","Unauthorized"); return ResponseEntity.status(401).body(err); }
        User u = (User) authentication.getPrincipal();
        Post p = posts.findById(id).orElseThrow();
        if (!p.getAuthor().getId().equals(u.getId())) { java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", "Forbidden"); return ResponseEntity.status(403).body(m); }
        posts.delete(p);
        java.util.Map<String,Object> out = new java.util.HashMap<>(); out.put("deleted", true); return ResponseEntity.ok(out);
    }

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<?> deleteComment(org.springframework.security.core.Authentication authentication, @PathVariable Long postId, @PathVariable Long commentId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) { java.util.Map<String,Object> err = new java.util.HashMap<>(); err.put("error","Unauthorized"); return ResponseEntity.status(401).body(err); }
        User u = (User) authentication.getPrincipal();
        Post p = posts.findById(postId).orElseThrow();
        Comment target = p.getComments().stream().filter(c -> c.getId() != null && c.getId().equals(commentId)).findFirst().orElse(null);
        if (target == null) return ResponseEntity.notFound().build();
        boolean isPostAuthor = p.getAuthor() != null && p.getAuthor().getId() != null && p.getAuthor().getId().equals(u.getId());
        boolean isCommentAuthorByName = target.getAuthorName() != null && target.getAuthorName().equals(u.getName());
        if (!isPostAuthor && !isCommentAuthorByName) { java.util.Map<String,Object> m = new java.util.HashMap<>(); m.put("error", "Forbidden"); return ResponseEntity.status(403).body(m); }
        p.getComments().removeIf(c -> c.getId() != null && c.getId().equals(commentId));
        posts.save(p);
        java.util.Map<String,Object> out = new java.util.HashMap<>(); out.put("deleted", true); return ResponseEntity.ok(out);
    }

    private Map<String, Object> toDto(Post p) {
        List<Map<String,Object>> comments;
        if (p.getComments() == null) {
            comments = java.util.List.of();
        } else {
            comments = p.getComments().stream().map(c -> {
                java.util.Map<String,Object> cm = new java.util.HashMap<>();
                cm.put("id", c.getId());
                cm.put("text", c.getText());
                cm.put("authorName", c.getAuthorName());
                cm.put("createdAt", c.getCreatedAt() == null ? null : c.getCreatedAt().toString());
                return cm;
            }).toList();
        }

        List<Long> likes;
        if (p.getLikedBy() == null) {
            likes = java.util.List.of();
        } else {
            likes = p.getLikedBy().stream().map(u -> u.getId()).toList();
        }

        java.util.Map<String,Object> out = new java.util.HashMap<>();
        out.put("id", p.getId());
        out.put("caption", p.getCaption());
        out.put("imageUrl", p.getImageUrl());
        out.put("createdAt", p.getCreatedAt() == null ? null : p.getCreatedAt().toString());
        out.put("authorId", p.getAuthor() == null ? null : p.getAuthor().getId());
        out.put("authorName", p.getAuthor() == null ? null : p.getAuthor().getName());
            out.put("authorRole", p.getAuthor() == null ? "FARMER" : p.getAuthor().getRole());
            out.put("isVerifiedExpert", p.getAuthor() == null ? false : p.getAuthor().isVerifiedExpert());
        out.put("likes", likes);
        out.put("comments", comments);
        return out;
    }
}
