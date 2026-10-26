
package com.example.socialbackend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.Set;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Column(name = "verified", nullable = false)
    private boolean verified = false;

    public boolean isVerified() { return this.verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
        @Column(name = "expert_post", nullable = false)
        private boolean isExpertPost = false;

        public boolean isExpertPost() { return this.isExpertPost; }
        public void setIsExpertPost(boolean isExpertPost) { this.isExpertPost = isExpertPost; }
    // ...existing code...

    public Instant getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getCaption() { return this.caption; }
    public void setCaption(String caption) { this.caption = caption; }
    public String getImageUrl() { return this.imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public User getAuthor() { return this.author; }
    public void setAuthor(User author) { this.author = author; }
    public List<Comment> getComments() { return this.comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Short caption for image posts
    private String caption;

    // Publicly accessible image URL (relative path served by the app, e.g. /uploads/abc.jpg)
    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToMany
    @JoinTable(
        name = "post_likes",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likedBy = new HashSet<>();

    // Comments are preserved for backward compatibility
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    // Explicit getters/setters to ensure availability even if Lombok processing is not applied
    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    public Set<User> getLikedBy() { return this.likedBy; }
    public void setLikedBy(Set<User> likedBy) { this.likedBy = likedBy; }

    public void addLike(User u) {
        if (likedBy == null) likedBy = new HashSet<>();
        likedBy.add(u);
        if (u.getLikedPosts() == null) u.setLikedPosts(new java.util.HashSet<>());
        u.getLikedPosts().add(this);
    }

    public void removeLike(User u) {
        if (likedBy != null) likedBy.removeIf(x -> x.getId().equals(u.getId()));
        if (u.getLikedPosts() != null) u.getLikedPosts().removeIf(p -> p == this);
    }

    // Backwards compatibility: some code/tests expect a 'content' property
    public String getContent() { return this.caption; }
    public void setContent(String content) { this.caption = content; }
}
