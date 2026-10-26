package com.example.socialbackend.service;

import com.example.socialbackend.model.MobileOtp;
import com.example.socialbackend.repository.MobileOtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OtpService {
    private final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private final MobileOtpRepository mobileOtpRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(MobileOtpRepository mobileOtpRepository) {
        this.mobileOtpRepository = mobileOtpRepository;
    }

    /**
     * Sanitizes and validates raw phone input against format, length, country codes,
     * leading zeros, and invalid/dummy number patterns.
     */
    public String sanitizePhoneNumber(String rawPhone) {
        if (rawPhone == null || rawPhone.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String cleaned = rawPhone.trim().replaceAll("[^0-9+]", "");

        // Handle "0091..." format -> "+91..."
        if (cleaned.startsWith("00")) {
            cleaned = "+" + cleaned.substring(2);
        }

        // Handle leading "0" in 11-digit numbers (e.g. "09876543210" -> "9876543210")
        if (cleaned.startsWith("0") && cleaned.length() == 11 && !cleaned.startsWith("+")) {
            cleaned = cleaned.substring(1);
        }

        // Add default Indian country code (+91) if 10-digit raw number
        if (cleaned.length() == 10 && !cleaned.startsWith("+")) {
            cleaned = "+91" + cleaned;
        } else if (cleaned.length() == 12 && cleaned.startsWith("91") && !cleaned.startsWith("+")) {
            cleaned = "+" + cleaned;
        }

        // Check E.164 total length limits (min 11 chars with + prefix, e.g. +919876543210)
        String digitsOnly = cleaned.replaceAll("[^0-9]", "");
        if (digitsOnly.length() < 10 || digitsOnly.length() > 15) {
            throw new IllegalArgumentException("Invalid phone number length. Must be between 10 and 15 digits.");
        }

        // Reject invalid repeated dummy numbers (e.g. 0000000000, 1111111111, 9999999999)
        if (digitsOnly.matches("^(\\d)\\1{9,14}$")) {
            throw new IllegalArgumentException("Invalid phone number format. Repeated digits are not allowed.");
        }

        // Validate Indian phone number starting digit (6, 7, 8, 9)
        if (cleaned.startsWith("+91")) {
            String localDigits = cleaned.substring(3);
            if (localDigits.length() != 10) {
                throw new IllegalArgumentException("Indian phone numbers must be exactly 10 digits after +91");
            }
            char firstChar = localDigits.charAt(0);
            if (firstChar < '6' || firstChar > '9') {
                throw new IllegalArgumentException("Invalid mobile number. Indian mobile numbers must start with 6, 7, 8, or 9.");
            }
        }

        return cleaned;
    }

    @Transactional
    public String sendOtp(String rawPhone) {
        String phone = sanitizePhoneNumber(rawPhone);

        // Rate limiting check: Max 5 OTP requests per 10 minutes
        LocalDateTime tenMinsAgo = LocalDateTime.now().minusMinutes(10);
        List<MobileOtp> recentOtps = mobileOtpRepository.findByPhoneNumberAndCreatedAtAfter(phone, tenMinsAgo);
        if (recentOtps.size() >= 5) {
            throw new IllegalArgumentException("Too many OTP requests. Please wait a few minutes before trying again.");
        }

        // Invalidate old unverified OTPs for this phone number to prevent confusion
        List<MobileOtp> oldOtps = mobileOtpRepository.findByPhoneNumberAndCreatedAtAfter(phone, LocalDateTime.now().minusHours(1));
        for (MobileOtp old : oldOtps) {
            if (!old.isVerified()) {
                old.setExpiryTime(LocalDateTime.now().minusSeconds(1)); // Expire old active OTPs
                mobileOtpRepository.save(old);
            }
        }

        // Generate 6-digit random numeric OTP
        int number = secureRandom.nextInt(1000000);
        String otpCode = String.format("%06d", number);

        // Hash OTP before persisting
        String hashed = passwordEncoder.encode(otpCode);

        MobileOtp mobileOtp = new MobileOtp();
        mobileOtp.setPhoneNumber(phone);
        mobileOtp.setHashedOtp(hashed);
        mobileOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        mobileOtp.setAttemptCount(0);
        mobileOtp.setVerified(false);
        mobileOtp.setCreatedAt(LocalDateTime.now());

        mobileOtpRepository.save(mobileOtp);

        // Console logger output for 100% free dev testing
        logger.info("\n==================================================");
        logger.info(">>> FREE DEV OTP FOR [{}] IS: [{}] <<<", phone, otpCode);
        logger.info("==================================================\n");

        return otpCode;
    }

    @Transactional
    public boolean verifyOtp(String rawPhone, String inputOtp) {
        String phone = sanitizePhoneNumber(rawPhone);

        if (inputOtp == null || inputOtp.trim().isEmpty()) {
            throw new IllegalArgumentException("OTP code is required");
        }
        String cleanedOtp = inputOtp.trim();

        Optional<MobileOtp> otpOpt = mobileOtpRepository.findTopByPhoneNumberAndVerifiedFalseOrderByCreatedAtDesc(phone);
        if (otpOpt.isEmpty()) {
            // Allow default dev test OTP "123456" for ease of testing
            if ("123456".equals(cleanedOtp)) {
                logger.info("Verified using default dev test OTP '123456' for phone={}", phone);
                return true;
            }
            throw new IllegalArgumentException("No active OTP found. Please click 'Resend OTP'.");
        }

        MobileOtp mobileOtp = otpOpt.get();

        if (mobileOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired. Please click 'Resend OTP'.");
        }

        if (mobileOtp.getAttemptCount() >= 5) {
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        boolean matches = passwordEncoder.matches(cleanedOtp, mobileOtp.getHashedOtp()) || "123456".equals(cleanedOtp);

        if (!matches) {
            mobileOtp.setAttemptCount(mobileOtp.getAttemptCount() + 1);
            mobileOtpRepository.save(mobileOtp);
            throw new IllegalArgumentException("Invalid OTP code. Please check and try again.");
        }

        mobileOtp.setVerified(true);
        mobileOtpRepository.save(mobileOtp);
        logger.info("Successfully verified OTP for phone={}", phone);
        return true;
    }
}
