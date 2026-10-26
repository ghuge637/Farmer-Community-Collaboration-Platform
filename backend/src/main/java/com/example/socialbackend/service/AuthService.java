package com.example.socialbackend.service;

import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository users;
    private final BCryptPasswordEncoder pw = new BCryptPasswordEncoder();
    private final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public AuthService(UserRepository users) { this.users = users; }

    public User register(String name, String email, String password) {
        if (email == null || email.trim().isEmpty()) throw new IllegalArgumentException("Email is required");
        if (password == null || password.trim().isEmpty()) throw new IllegalArgumentException("Password is required");
        String normEmailCheck = email.trim().toLowerCase();
        if (users.findByEmail(normEmailCheck).isPresent()) throw new RuntimeException("User already exists");
        User u = new User();
        u.setName(name == null ? "" : name);
        String normEmail = email.trim().toLowerCase();
        u.setEmail(normEmail);
        u.setPassword(pw.encode(password));
        u.setAvatarColor("#c4b5fd");
        u.setRole(User.Role.FARMER); // default role
        u.setVerificationStatus(User.VerificationStatus.PENDING); // default status
        u.setVerifiedExpert(false); // default
        User saved = users.save(u);
        logger.debug("Registered user id={} email={}", saved.getId(), saved.getEmail());
        return saved;
    }

    public User verify(String email, String password) {
        if (email == null) return null;
        String norm = email.trim().toLowerCase();
        logger.debug("Verifying login for normalized email={}", norm);
        return users.findByEmail(norm).map(u -> {
            String storedHash = u.getPassword();
            boolean ok = pw.matches(password, storedHash);
            logger.debug("Login attempt for email={} foundUserId={} storedHashLen={} passwordMatch={}", norm, u.getId(), storedHash == null ? 0 : storedHash.length(), ok);
            return ok ? u : null;
        }).orElseGet(() -> {
            logger.debug("Login attempt for email={} : user not found", norm);
            return null;
        });
    }

    public User loginOrRegisterWithMobile(String phoneNumber, String optionalName) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        String phone = phoneNumber.trim();

        return users.findByPhoneNumber(phone).orElseGet(() -> {
            logger.info("Auto-registering new user with phone={}", phone);
            User u = new User();
            u.setPhoneNumber(phone);
            String displayName = (optionalName != null && !optionalName.trim().isEmpty()) 
                    ? optionalName.trim() 
                    : "Farmer " + (phone.length() >= 4 ? phone.substring(phone.length() - 4) : phone);
            u.setName(displayName);
            u.setAvatarColor("#10b981");
            u.setRole(User.Role.FARMER);
            u.setVerificationStatus(User.VerificationStatus.APPROVED);
            return users.save(u);
        });
    }

    public boolean isPhoneNumberRegistered(String phoneNumber) {
        if (phoneNumber == null) return false;
        return users.existsByPhoneNumber(phoneNumber.trim());
    }
}