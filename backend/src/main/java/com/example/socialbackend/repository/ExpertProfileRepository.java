package com.example.socialbackend.repository;

import com.example.socialbackend.model.ExpertProfile;
import com.example.socialbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExpertProfileRepository extends JpaRepository<ExpertProfile, Long> {
    Optional<ExpertProfile> findByUser(User user);
    Optional<ExpertProfile> findByUserId(Long userId);

    java.util.List<ExpertProfile> findAllByVerificationStatus(ExpertProfile.VerificationStatus status);
}
