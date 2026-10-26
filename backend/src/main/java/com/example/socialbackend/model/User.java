package com.example.socialbackend.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    public enum Role {
        FARMER, EXPERT, ADMIN
    }

    public enum VerificationStatus {
        PENDING, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.FARMER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(nullable = false)
    private boolean isVerifiedExpert = false;

    @Column(unique = true, nullable = true)
    private String email;

    @Column(name = "phone_number", unique = true, nullable = true)
    private String phoneNumber;

    private String name;

    @Column(nullable = true)
    private String password;

    private String bio;
    // URL to avatar/profile picture
    private String avatarUrl;

    public String getAvatarUrl() { return this.avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    // URL to cover photo
    private String coverUrl;

    public String getCoverUrl() { return this.coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    @Column(name = "avatar_color")
    private String avatarColor;

    private String region;

    // --- Reciprocal labor scheduling fields (farmer-to-farmer, no money) ---
    @Column(name = "location_lat")
    private Double locationLat;

    @Column(name = "location_lng")
    private Double locationLng;

    @Column(name = "labor_credit_balance", nullable = false)
    private int laborCreditBalance = 0;

    @Column(name = "daily_commitment_limit", nullable = false)
    private int dailyCommitmentLimit = 1;

    @ManyToMany(mappedBy = "likedBy")
    private Set<Post> likedPosts = new java.util.HashSet<>();

    // Followers: users who follow this user
    @ManyToMany
    @JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "following_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    private java.util.Set<User> followers = new java.util.HashSet<>();

    // Following: users this user follows (inverse side of the same join table)
    @ManyToMany(mappedBy = "followers")
    private java.util.Set<User> following = new java.util.HashSet<>();

    // Explicit getters/setters
    public Long getId() { return this.id; }
    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return this.phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getName() { return this.name; }
    public void setName(String name) { this.name = name; }
    public String getPassword() { return this.password; }
    public void setPassword(String password) { this.password = password; }
    public String getBio() { return this.bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvatarColor() { return this.avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
    public String getRegion() { return this.region; }
    public void setRegion(String region) { this.region = region; }
    public Double getLocationLat() { return this.locationLat; }
    public void setLocationLat(Double locationLat) { this.locationLat = locationLat; }
    public Double getLocationLng() { return this.locationLng; }
    public void setLocationLng(Double locationLng) { this.locationLng = locationLng; }
    public int getLaborCreditBalance() { return this.laborCreditBalance; }
    public void setLaborCreditBalance(int laborCreditBalance) { this.laborCreditBalance = laborCreditBalance; }
    public int getDailyCommitmentLimit() { return this.dailyCommitmentLimit; }
    public void setDailyCommitmentLimit(int dailyCommitmentLimit) { this.dailyCommitmentLimit = dailyCommitmentLimit; }
    public java.util.Set<com.example.socialbackend.model.Post> getLikedPosts() { return this.likedPosts; }
    public void setLikedPosts(java.util.Set<com.example.socialbackend.model.Post> p) { this.likedPosts = p; }
    public java.util.Set<User> getFollowers() { return this.followers; }
    public void setFollowers(java.util.Set<User> followers) { this.followers = followers; }
    public java.util.Set<User> getFollowing() { return this.following; }
    public void setFollowing(java.util.Set<User> following) { this.following = following; }

    public Role getRole() { return this.role; }
    public void setRole(Role role) { this.role = role; }
    public VerificationStatus getVerificationStatus() { return this.verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public boolean isVerifiedExpert() { return isVerifiedExpert; }
    public void setVerifiedExpert(boolean verifiedExpert) { isVerifiedExpert = verifiedExpert; }

    // ===== UserDetails =====
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == Role.ADMIN) {
            return List.of(() -> "ROLE_ADMIN");
        } else if (role == Role.EXPERT) {
            return List.of(() -> "ROLE_EXPERT");
        } else {
            return List.of(() -> "ROLE_FARMER");
        }
    }
    @Override
    public String getUsername() {
        return phoneNumber != null ? phoneNumber : email;
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
