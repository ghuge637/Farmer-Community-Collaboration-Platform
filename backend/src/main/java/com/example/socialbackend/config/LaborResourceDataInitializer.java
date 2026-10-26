package com.example.socialbackend.config;

import com.example.socialbackend.repository.LaborResourceRepository;
import com.example.socialbackend.service.LaborResourceSeedData;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class LaborResourceDataInitializer implements CommandLineRunner {
    private final LaborResourceRepository laborResourceRepository;

    public LaborResourceDataInitializer(LaborResourceRepository laborResourceRepository) {
        this.laborResourceRepository = laborResourceRepository;
    }

    @Override
    public void run(String... args) {
        if (laborResourceRepository.count() > 0) {
            return;
        }

        laborResourceRepository.saveAll(LaborResourceSeedData.defaultResources());
    }
}
