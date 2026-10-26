package com.example.socialbackend.controller;

import com.example.socialbackend.service.LaborResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/labor")
public class LaborResourceController {
    private final LaborResourceService laborResourceService;

    public LaborResourceController(LaborResourceService laborResourceService) {
        this.laborResourceService = laborResourceService;
    }

    @GetMapping
    public ResponseEntity<?> listLaborResources() {
        var out = laborResourceService.getEnabledLaborResources().stream().map(resource -> {
            var item = new java.util.HashMap<String, Object>();
            item.put("id", resource.getId());
            item.put("name", resource.getName());
            item.put("role", resource.getRole());
            item.put("roleMr", resource.getRoleMr());
            item.put("experience", resource.getExperienceYears());
            item.put("location", resource.getLocation());
            item.put("status", resource.getStatus().name());
            item.put("phone", resource.getPhone());
            item.put("avatarColor", resource.getAvatarColor());
            return item;
        }).toList();

        return ResponseEntity.ok(out);
    }
}
