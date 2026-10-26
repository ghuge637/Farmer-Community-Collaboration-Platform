package com.example.socialbackend.controller;

import com.example.socialbackend.model.User;
import com.example.socialbackend.security.JwtUtil;
import com.example.socialbackend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;

import com.example.socialbackend.service.OtpService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final JwtUtil jwt;
    private final OtpService otpService;
    private final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.dev-mode:true}")
    private boolean devMode;

    public AuthController(AuthService auth, JwtUtil jwt, OtpService otpService) { 
        this.auth = auth; 
        this.jwt = jwt; 
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String,String> body) {
        try {
            User u = auth.register(body.get("name"), body.get("email"), body.get("password"));
            String token = jwt.generateToken(u.getId());
            logger.info("User registered: {}", u.getEmail());
            ResponseCookie cookie = buildAuthCookie(token, jwt.getExpiryMs() / 1000);
            java.util.Map<String,Object> out = new java.util.HashMap<>();
            out.put("token", token);
            out.put("userId", u.getId());
            out.put("name", u.getName());
            out.put("email", u.getEmail());
            out.put("bio", u.getBio());
            out.put("avatarColor", u.getAvatarColor());
            out.put("region", u.getRegion());
            out.put("role", u.getRole() != null ? u.getRole().name() : null);
            out.put("laborCreditBalance", u.getLaborCreditBalance());
            out.put("dailyCommitmentLimit", u.getDailyCommitmentLimit());
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(out);
        } catch (IllegalArgumentException e) {
            logger.warn("Bad register request: {}", e.getMessage());
            java.util.Map<String,Object> err = new java.util.HashMap<>();
            err.put("error", e.getMessage() == null ? "" : e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (DataIntegrityViolationException e) {
            logger.warn("Register conflict for email", e);
            java.util.Map<String,Object> err = new java.util.HashMap<>();
            err.put("error", "Email already exists");
            return ResponseEntity.status(409).body(err);
        } catch (DataAccessException e) {
            logger.error("Database error during register", e);
            java.util.Map<String,Object> err = new java.util.HashMap<>();
            err.put("error", "Database unavailable");
            return ResponseEntity.status(503).body(err);
        } catch (RuntimeException e) {
            logger.warn("Registration failed: {}", e.getMessage());
            java.util.Map<String,Object> err = new java.util.HashMap<>();
            err.put("error", e.getMessage() == null ? "" : e.getMessage());
            return ResponseEntity.status(409).body(err);
        } catch (Exception e) {
            logger.error("Unhandled exception during registration", e);
            java.util.Map<String,Object> err = new java.util.HashMap<>();
            err.put("error", "Internal server error");
            return ResponseEntity.status(500).body(err);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body) {
        logger.debug("Login request received");
        User u = auth.verify(body.get("email"), body.get("password"));
        if (u == null) {
            logger.info("Login failed for email={}", body.get("email"));
            java.util.Map<String,Object> err = new java.util.HashMap<>();
            err.put("error", "Invalid credentials");
            return ResponseEntity.status(401).body(err);
        }
        String token = jwt.generateToken(u.getId());
        ResponseCookie cookie = buildAuthCookie(token, jwt.getExpiryMs() / 1000);
        logger.info("Login success for userId={}", u.getId());
        java.util.Map<String,Object> out = new java.util.HashMap<>();
        out.put("token", token);
        out.put("userId", u.getId());
        out.put("name", u.getName());
        out.put("email", u.getEmail());
        out.put("bio", u.getBio());
        out.put("avatarColor", u.getAvatarColor());
        out.put("userId", u.getId());
        out.put("name", u.getName());
        out.put("email", u.getEmail());
        out.put("bio", u.getBio());
        out.put("avatarColor", u.getAvatarColor());
        out.put("region", u.getRegion());
        out.put("role", u.getRole() != null ? u.getRole().name() : null);
        out.put("laborCreditBalance", u.getLaborCreditBalance());
        out.put("dailyCommitmentLimit", u.getDailyCommitmentLimit());
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(out);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        try {
            String rawPhone = body.get("phoneNumber");
            String sanitizedPhone = otpService.sanitizePhoneNumber(rawPhone);
            String devOtp = otpService.sendOtp(sanitizedPhone);
            boolean isNewUser = !auth.isPhoneNumberRegistered(sanitizedPhone);

            java.util.Map<String, Object> out = new java.util.HashMap<>();
            out.put("success", true);
            out.put("isNewUser", isNewUser);
            out.put("message", "OTP sent successfully");
            out.put("devOtp", devOtp); // Provided for quick 100% free dev testing
            return ResponseEntity.ok(out);
        } catch (IllegalArgumentException e) {
            java.util.Map<String, Object> err = new java.util.HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            logger.error("Error sending OTP", e);
            java.util.Map<String, Object> err = new java.util.HashMap<>();
            err.put("error", "Failed to send OTP. Please try again.");
            return ResponseEntity.status(500).body(err);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            String phoneNumber = body.get("phoneNumber");
            String otp = body.get("otp");
            String name = body.get("name");

            boolean verified = otpService.verifyOtp(phoneNumber, otp);
            if (!verified) {
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("error", "Invalid OTP");
                return ResponseEntity.badRequest().body(err);
            }

            String sanitizedPhone = otpService.sanitizePhoneNumber(phoneNumber);
            User u = auth.loginOrRegisterWithMobile(sanitizedPhone, name);

            String token = jwt.generateToken(u.getId());
            ResponseCookie cookie = buildAuthCookie(token, jwt.getExpiryMs() / 1000);

            logger.info("Mobile OTP Login success for userId={} phone={}", u.getId(), u.getPhoneNumber());

            java.util.Map<String, Object> out = new java.util.HashMap<>();
            out.put("token", token);
            out.put("userId", u.getId());
            out.put("name", u.getName());
            out.put("email", u.getEmail());
            out.put("phoneNumber", u.getPhoneNumber());
            out.put("bio", u.getBio());
            out.put("avatarColor", u.getAvatarColor());
            out.put("region", u.getRegion());
            out.put("role", u.getRole() != null ? u.getRole().name() : null);
            out.put("laborCreditBalance", u.getLaborCreditBalance());
            out.put("dailyCommitmentLimit", u.getDailyCommitmentLimit());
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(out);
        } catch (IllegalArgumentException e) {
            java.util.Map<String, Object> err = new java.util.HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            logger.error("Error verifying OTP", e);
            java.util.Map<String, Object> err = new java.util.HashMap<>();
            err.put("error", "Verification failed. Please try again.");
            return ResponseEntity.status(500).body(err);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) return ResponseEntity.status(401).build();
        User u = (User) authentication.getPrincipal();
        java.util.Map<String,Object> out = new java.util.HashMap<>();
        out.put("id", u.getId());
        out.put("name", u.getName());
        out.put("email", u.getEmail());
        out.put("phoneNumber", u.getPhoneNumber());
        out.put("bio", u.getBio());
        out.put("avatarColor", u.getAvatarColor());
        out.put("region", u.getRegion());
        out.put("role", u.getRole() != null ? u.getRole().name() : null);
        out.put("laborCreditBalance", u.getLaborCreditBalance());
        out.put("dailyCommitmentLimit", u.getDailyCommitmentLimit());
        return ResponseEntity.ok(out);
    }

    @GetMapping("/cookie-status")
    public ResponseEntity<?> cookieStatus(HttpServletRequest request) {
        boolean hasAuthCookie = false;
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie c : cookies) {
                if ("AUTH_TOKEN".equals(c.getName())) {
                    hasAuthCookie = true;
                    break;
                }
            }
        }
        boolean hasAuthHeader = request.getHeader("Authorization") != null;
        java.util.Map<String,Object> out = new java.util.HashMap<>();
        out.put("authCookiePresent", hasAuthCookie);
        out.put("authHeaderPresent", hasAuthHeader);
        return ResponseEntity.ok(out);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = buildAuthCookie("", 0);
        java.util.Map<String,Object> out = new java.util.HashMap<>();
        out.put("ok", true);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(out);
    }

    private ResponseCookie buildAuthCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from("AUTH_TOKEN", token)
            .httpOnly(true)
            .path("/")
            .maxAge(maxAgeSeconds)
            .sameSite(cookieSameSite)
            .secure(cookieSecure)
            .build();
    }
}
