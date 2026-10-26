package com.example.socialbackend.controller;

import com.example.socialbackend.model.ExpertProfile;
import com.example.socialbackend.model.User;
import com.example.socialbackend.service.ExpertProfileService;
import com.example.socialbackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/expert")
public class ExpertProfileController {
    private final ExpertProfileService expertProfileService;
    private final UserRepository userRepository;

    public ExpertProfileController(ExpertProfileService expertProfileService, UserRepository userRepository) {
        this.expertProfileService = expertProfileService;
        this.userRepository = userRepository;
    }

    // Public endpoint to list all verified experts
    @GetMapping("/verified")
    public ResponseEntity<?> listVerifiedExperts(HttpServletRequest request) {
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ExpertProfileController.class);
        logger.info("ExpertProfileController.listVerifiedExperts called. URI: {} Method: {} RemoteAddr: {}", request.getRequestURI(), request.getMethod(), request.getRemoteAddr());
        var experts = expertProfileService.getVerifiedExperts();
        var out = experts.stream().map(profile -> {
            var user = profile.getUser();
            var m = new java.util.HashMap<String, Object>();
            m.put("id", user.getId());
            m.put("name", user.getName());
            m.put("email", user.getEmail());
            m.put("bio", user.getBio());
            m.put("avatarColor", user.getAvatarColor());
            m.put("role", user.getRole());
            m.put("isVerifiedExpert", user.isVerifiedExpert());
            m.put("specialization", profile.getSpecialization());
            m.put("cropExpertise", profile.getCropExpertise());
            m.put("yearsOfExperience", profile.getYearsOfExperience());
            m.put("region", profile.getRegion());
            m.put("expertBio", profile.getBio());
            return m;
        }).toList();
        logger.info("ExpertProfileController.listVerifiedExperts returning {} experts", out.size());
        return ResponseEntity.ok(out);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyForExpert(@RequestBody Map<String, Object> body, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User user = (User) authentication.getPrincipal();
        if (user.getRole() != User.Role.FARMER) {
            return ResponseEntity.status(403).body(Map.of("error", "Only FARMER can apply for expert role"));
        }
        if (expertProfileService.findByUser(user).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("error", "You have already applied for expert role"));
        }
        ExpertProfile profile = new ExpertProfile();
        profile.setUser(user);
        profile.setSpecialization((String) body.getOrDefault("specialization", null));
        profile.setCropExpertise((String) body.getOrDefault("cropExpertise", null));
        profile.setYearsOfExperience(body.get("yearsOfExperience") instanceof Number ? ((Number) body.get("yearsOfExperience")).intValue() : null);
        profile.setRegion((String) body.getOrDefault("region", null));
        profile.setBio((String) body.getOrDefault("bio", null));
        profile.setVerified(false);
        profile.setVerificationStatus(ExpertProfile.VerificationStatus.PENDING);
        expertProfileService.save(profile);
        return ResponseEntity.ok(Map.of("message", "Application submitted and pending review"));
    }
}
