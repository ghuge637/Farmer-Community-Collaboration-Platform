package com.example.socialbackend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expert_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpertProfile {
        public Long getId() { return this.id; }
        public User getUser() { return this.user; }
        public String getSpecialization() { return this.specialization; }
        public String getCropExpertise() { return this.cropExpertise; }
        public Integer getYearsOfExperience() { return this.yearsOfExperience; }
        public String getRegion() { return this.region; }
        public String getBio() { return this.bio; }
        public boolean isVerified() { return this.verified; }
        public VerificationStatus getVerificationStatus() { return this.verificationStatus; }
    public enum VerificationStatus {
        PENDING, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String specialization;
    private String cropExpertise;
    @Column(name = "years_experience", nullable = false)
    private Integer yearsOfExperience;
    private String region;
    private String bio;
    private boolean verified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    public void setUser(User user) {
        this.user = user;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public void setCropExpertise(String cropExpertise) {
        this.cropExpertise = cropExpertise;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
}
