package com.example.socialbackend.repository;

import com.example.socialbackend.model.LaborResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LaborResourceRepository extends JpaRepository<LaborResource, Long> {
    List<LaborResource> findByEnabledTrueOrderByDisplayOrderAscNameAsc();
}
