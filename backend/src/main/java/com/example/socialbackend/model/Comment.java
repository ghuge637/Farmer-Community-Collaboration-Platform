package com.example.socialbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "comments")
public class Comment {
        // Explicit getters and setters for compatibility
        public Long getId() { return this.id; }
        public void setId(Long id) { this.id = id; }
        public String getText() { return this.text; }
        public void setText(String text) { this.text = text; }
        public String getAuthorName() { return this.authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        public Instant getCreatedAt() { return this.createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Post getPost() { return this.post; }
        public void setPost(Post post) { this.post = post; }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    private String authorName;

    @Column(name = "created_at")
    private Instant createdAt;

    @com.fasterxml.jackson.annotation.JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}
