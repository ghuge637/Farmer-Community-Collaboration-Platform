package com.example.socialbackend.repository;

import com.example.socialbackend.model.Scheme;
import com.example.socialbackend.model.User;
import com.example.socialbackend.model.UserSchemeTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSchemeTrackerRepository extends JpaRepository<UserSchemeTracker, Long> {
    List<UserSchemeTracker> findByUserOrderByUpdatedAtDesc(User user);
    Optional<UserSchemeTracker> findByUserAndScheme(User user, Scheme scheme);
}
