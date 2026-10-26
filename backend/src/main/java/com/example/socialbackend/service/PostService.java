package com.example.socialbackend.service;

import com.example.socialbackend.model.Post;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.PostRepository;
import com.example.socialbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;
import com.example.socialbackend.service.FileStorageService;

import java.util.HashSet;

@Service
public class PostService {
    private final PostRepository posts;
    private final UserRepository users;
    private final FileStorageService fileStorage;
    private final Logger logger = LoggerFactory.getLogger(PostService.class);

    public PostService(PostRepository posts, UserRepository users, FileStorageService fileStorage) {
        this.posts = posts;
        this.users = users;
        this.fileStorage = fileStorage;
    }

    @Transactional
    public Post toggleLike(Long postId, Long userId) {
        // Acquire a PESSIMISTIC_WRITE lock to prevent concurrent deletions/races that can cause FK violations
        Post p = posts.findByIdForUpdate(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        User u = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (p.getLikedBy() == null) p.setLikedBy(new HashSet<>());
        if (u.getLikedPosts() == null) u.setLikedPosts(new HashSet<>());

        boolean currentlyLiked = p.getLikedBy().stream().anyMatch(x -> x.getId().equals(u.getId()));
        if (currentlyLiked) {
            logger.debug("Removing like from postId={} by userId={}", postId, userId);
            p.removeLike(u);
        } else {
            logger.debug("Adding like to postId={} by userId={}", postId, userId);
            p.addLike(u);
        }

        try {
            return posts.save(p);
        } catch (DataIntegrityViolationException ex) {
            logger.warn("Data integrity violation during toggleLike for postId={} userId={}", postId, userId, ex);
            // Distinguish between 'post deleted' vs other integrity problems
            if (!posts.existsById(postId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
            }
            // Otherwise, rethrow as conflict so controller can reload latest state
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Database integrity error");
        }
    }

    @Transactional
    public Post createImagePost(MultipartFile file, String caption, Long userId) {
        User u = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String imageUrl;
        try {
            imageUrl = fileStorage.store(file);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        Post p = new Post();
        p.setAuthor(u);
        p.setCaption(caption);
        p.setImageUrl(imageUrl);
        p.setCreatedAt(java.time.Instant.now());
        p.setIsExpertPost(false); // Set default value
        p.setVerified(false); // Set default value
        if (p.getLikedBy() == null) p.setLikedBy(new java.util.HashSet<>());
        return posts.save(p);
    }

    @Transactional
    public Post createPost(Long userId, String contentOrCaption, org.springframework.web.multipart.MultipartFile file) {
        logger.debug("createPost called by userId={} hasFile={} captionPresent={}", userId, (file != null && !file.isEmpty()), contentOrCaption != null && !contentOrCaption.isBlank());
        if (file != null && !file.isEmpty()) {
            Post created = createImagePost(file, contentOrCaption, userId);
            logger.info("Image post created id={} by userId={}", created.getId(), userId);
            return created;
        }
        User u = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Post p = new Post();
        p.setAuthor(u);
        p.setCaption(contentOrCaption);
        p.setCreatedAt(java.time.Instant.now());
        p.setIsExpertPost(false); // Set default value
        p.setVerified(false); // Set default value
        if (p.getLikedBy() == null) p.setLikedBy(new java.util.HashSet<>());
        Post saved = posts.save(p);
        logger.info("Text post created id={} by userId={}", saved.getId(), userId);
        return saved;
    }
}
