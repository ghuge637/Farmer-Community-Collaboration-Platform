package com.example.socialbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.socialbackend.model.ExpertProfile;
import com.example.socialbackend.service.ExpertProfileService;
import com.example.socialbackend.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final ExpertProfileService expertProfileService;
    private final UserRepository userRepository;

    public AdminController(ExpertProfileService expertProfileService, UserRepository userRepository) {
        this.expertProfileService = expertProfileService;
        this.userRepository = userRepository;
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/expert/{id}/approve")
    @Transactional
    public ResponseEntity<?> approveExpert(@PathVariable Long id) {
        var expertOpt = expertProfileService.findById(id);
        if (expertOpt.isEmpty()) return ResponseEntity.notFound().build();
        var expert = expertOpt.get();
        var user = expert.getUser();
        if (user == null) return ResponseEntity.badRequest().body("No user for expert profile");
        user.setRole(com.example.socialbackend.model.User.Role.EXPERT);
        user.setVerifiedExpert(true);
        expert.setVerified(true);
        expert.setVerificationStatus(com.example.socialbackend.model.ExpertProfile.VerificationStatus.APPROVED);
        userRepository.save(user);
        expertProfileService.save(expert);
        return ResponseEntity.ok(Map.of("message", "Expert approved"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/expert/{id}/reject")
    @Transactional
    public ResponseEntity<?> rejectExpert(@PathVariable Long id) {
        var expertOpt = expertProfileService.findById(id);
        if (expertOpt.isEmpty()) return ResponseEntity.notFound().build();
        var expert = expertOpt.get();
        var user = expert.getUser();
        if (user == null) return ResponseEntity.badRequest().body("No user for expert profile");
        expert.setVerified(false);
        expert.setVerificationStatus(com.example.socialbackend.model.ExpertProfile.VerificationStatus.REJECTED);
        expertProfileService.save(expert);
        return ResponseEntity.ok(Map.of("message", "Expert rejected"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        List<ExpertProfile> pendingRequests = expertProfileService.getPendingRequests();
        // Map to DTO for frontend
        List<Map<String, Object>> pendingExpertApplications = pendingRequests.stream().map(ep -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", ep.getId());
            map.put("name", ep.getUser() != null ? ep.getUser().getName() : "");
            map.put("specialization", ep.getSpecialization());
            map.put("experience", ep.getYearsOfExperience());
            map.put("cropExpertise", ep.getCropExpertise());
            map.put("region", ep.getRegion());
            map.put("bio", ep.getBio());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of(
            "pendingExpertApplications", pendingExpertApplications
        ));
    }
}
