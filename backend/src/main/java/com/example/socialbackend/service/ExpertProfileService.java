
package com.example.socialbackend.service;

import com.example.socialbackend.model.ExpertProfile;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.ExpertProfileRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ExpertProfileService {

        public Optional<ExpertProfile> findById(Long id) {
            return expertProfileRepository.findById(id);
        }
    private final ExpertProfileRepository expertProfileRepository;

    public ExpertProfileService(ExpertProfileRepository expertProfileRepository) {
        this.expertProfileRepository = expertProfileRepository;
    }

    public ExpertProfile save(ExpertProfile profile) {
        return expertProfileRepository.save(profile);
    }

    public Optional<ExpertProfile> findByUser(User user) {
        return expertProfileRepository.findByUser(user);
    }

    public Optional<ExpertProfile> findByUserId(Long userId) {
        return expertProfileRepository.findByUserId(userId);
    }

    public java.util.List<ExpertProfile> getPendingRequests() {
        return expertProfileRepository.findAllByVerificationStatus(ExpertProfile.VerificationStatus.PENDING);
    }

    public java.util.List<ExpertProfile> getVerifiedExperts() {
        return expertProfileRepository.findAllByVerificationStatus(ExpertProfile.VerificationStatus.APPROVED);
    }
}
