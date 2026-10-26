package com.example.socialbackend.service;

import com.example.socialbackend.model.ExpertService;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.ExpertServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExpertServiceService {
    private final ExpertServiceRepository expertServiceRepository;

    @Autowired
    public ExpertServiceService(ExpertServiceRepository expertServiceRepository) {
        this.expertServiceRepository = expertServiceRepository;
    }

    public ExpertService save(ExpertService service) {
        return expertServiceRepository.save(service);
    }

    public List<ExpertService> getEnabledCoursesByExpert(User expert) {
        return expertServiceRepository.findByExpertAndEnabledTrue(expert);
    }

    public List<ExpertService> getEnabledCoursesByExpertId(Long expertId) {
        return expertServiceRepository.findByExpert_IdAndEnabledTrue(expertId);
    }

    public Optional<ExpertService> findById(Long id) {
        return expertServiceRepository.findById(id);
    }

    public void deleteById(Long id) {
        expertServiceRepository.deleteById(id);
    }
}
