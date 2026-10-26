package com.example.socialbackend.repository;

import com.example.socialbackend.model.ExpertService;
import com.example.socialbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpertServiceRepository extends JpaRepository<ExpertService, Long> {
    List<ExpertService> findByExpertAndEnabledTrue(User expert);
    List<ExpertService> findByExpert_IdAndEnabledTrue(Long expertId);
    List<ExpertService> findByEnabledTrue();
}
