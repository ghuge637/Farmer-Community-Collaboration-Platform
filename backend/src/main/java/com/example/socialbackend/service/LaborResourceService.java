package com.example.socialbackend.service;

import com.example.socialbackend.model.LaborResource;
import com.example.socialbackend.repository.LaborResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaborResourceService {
    private final LaborResourceRepository laborResourceRepository;

    public LaborResourceService(LaborResourceRepository laborResourceRepository) {
        this.laborResourceRepository = laborResourceRepository;
    }

    public List<LaborResource> getEnabledLaborResources() {
        List<LaborResource> resources = laborResourceRepository.findByEnabledTrueOrderByDisplayOrderAscNameAsc();
        if (!resources.isEmpty()) {
            return resources;
        }

        if (laborResourceRepository.count() == 0) {
            laborResourceRepository.saveAll(LaborResourceSeedData.defaultResources());
            return laborResourceRepository.findByEnabledTrueOrderByDisplayOrderAscNameAsc();
        }

        return resources;
    }
}
