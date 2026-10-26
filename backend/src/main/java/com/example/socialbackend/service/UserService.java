package com.example.socialbackend.service;

import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.UserRepository;
import com.example.socialbackend.model.ExpertProfile;
import com.example.socialbackend.service.ExpertProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository users;
    private final ExpertProfileService expertProfileService;

    @Autowired
    public UserService(UserRepository users, ExpertProfileService expertProfileService) {
        this.users = users;
        this.expertProfileService = expertProfileService;
    }
    public java.util.Optional<ExpertProfile> getExpertProfileByUserId(Long userId) {
        return expertProfileService.findByUserId(userId);
    }

    private User currentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        // Load fresh managed entity from repository to avoid detached entity / lazy init issues
        User p = (User) auth.getPrincipal();
        return users.findById(p.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    @Transactional
    public void followUser(Long targetUserId) {
        User me = currentAuthenticatedUser();
        if (me.getId().equals(targetUserId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot follow yourself");
        User target = users.findById(targetUserId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        // Prevent duplicate follows using repository query (avoid loading collections)
        if (users.existsFollower(targetUserId, me.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already following");
        }

        // Insert join-table row directly to avoid touching lazy collections
        users.addFollower(targetUserId, me.getId());
    }

    @Transactional
    public void unfollowUser(Long targetUserId) {
        User me = currentAuthenticatedUser();
        User target = users.findById(targetUserId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (me.getId().equals(targetUserId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot unfollow yourself");

        // Remove join-table row directly
        users.removeFollower(targetUserId, me.getId());
    }
}