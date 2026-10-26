package com.example.socialbackend.repository;

import com.example.socialbackend.model.MobileOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MobileOtpRepository extends JpaRepository<MobileOtp, Long> {
    Optional<MobileOtp> findTopByPhoneNumberAndVerifiedFalseOrderByCreatedAtDesc(String phoneNumber);
    List<MobileOtp> findByPhoneNumberAndCreatedAtAfter(String phoneNumber, LocalDateTime afterTime);
    void deleteByPhoneNumber(String phoneNumber);
}
