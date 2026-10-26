package com.example.socialbackend.service;

import com.example.socialbackend.model.LaborResource;

import java.util.List;

public final class LaborResourceSeedData {
    private LaborResourceSeedData() {
    }

    public static List<LaborResource> defaultResources() {
        return List.of(
            build("Ramesh Patil", "General Farm Worker", "\u0936\u0947\u0924\u092e\u091c\u0942\u0930", 5, "Pune", LaborResource.AvailabilityStatus.AVAILABLE, "919876543210", "#4caf50", 1),
            build("Suresh Mane", "Tractor Driver", "\u091f\u094d\u0930\u0945\u0915\u094d\u091f\u0930 \u091a\u093e\u0932\u0915", 8, "Nashik", LaborResource.AvailabilityStatus.BUSY, "919876543211", "#ff9800", 2),
            build("Ganesh Koli", "Harvester", "\u0915\u093e\u092a\u0923\u0940 \u0915\u093e\u092e\u0917\u093e\u0930", 3, "Satara", LaborResource.AvailabilityStatus.AVAILABLE, "919876543212", "#2196f3", 3),
            build("Vijay Deshmukh", "Pesticide Sprayer", "\u092b\u0935\u093e\u0930\u0923\u0940 \u0915\u093e\u092e\u0917\u093e\u0930", 6, "Nagpur", LaborResource.AvailabilityStatus.AVAILABLE, "919876543213", "#9c27b0", 4),
            build("Anita Shinde", "Weeding Specialist", "\u0916\u0941\u0930\u092a\u0923\u0940 \u0915\u093e\u092e\u0917\u093e\u0930", 4, "Solapur", LaborResource.AvailabilityStatus.AVAILABLE, "919876543214", "#e91e63", 5),
            build("Raju Pawar", "Irrigation Helper", "\u092a\u093e\u0923\u0940 \u092a\u0941\u0930\u0935\u0920\u093e \u092e\u0926\u0924\u0928\u0940\u0938", 2, "Aurangabad", LaborResource.AvailabilityStatus.AVAILABLE, "919876543215", "#00bcd4", 6),
            build("Vikas Pawar", "Farm Manager", "\u0936\u0947\u0924\u0940 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0915", 10, "Baramati", LaborResource.AvailabilityStatus.AVAILABLE, "919876543220", "#009688", 7),
            build("Suman Kale", "Sowing Specialist", "\u092a\u0947\u0930\u0923\u0940 \u0924\u091c\u094d\u091e", 6, "Latur", LaborResource.AvailabilityStatus.AVAILABLE, "919876543221", "#673ab7", 8),
            build("Arun Gaikwad", "Irrigation Expert", "\u0938\u093f\u0902\u091a\u0928 \u0924\u091c\u094d\u091e", 8, "Nanded", LaborResource.AvailabilityStatus.AVAILABLE, "919876543222", "#3f51b5", 9),
            build("Meena Patil", "General Helper", "\u092e\u0926\u0924\u0928\u0940\u0938", 2, "Dhule", LaborResource.AvailabilityStatus.AVAILABLE, "919876543223", "#e91e63", 10)
        );
    }

    private static LaborResource build(String name,
                                       String role,
                                       String roleMr,
                                       int experienceYears,
                                       String location,
                                       LaborResource.AvailabilityStatus status,
                                       String phone,
                                       String avatarColor,
                                       int displayOrder) {
        LaborResource resource = new LaborResource();
        resource.setName(name);
        resource.setRole(role);
        resource.setRoleMr(roleMr);
        resource.setExperienceYears(experienceYears);
        resource.setLocation(location);
        resource.setStatus(status);
        resource.setPhone(phone);
        resource.setAvatarColor(avatarColor);
        resource.setEnabled(true);
        resource.setDisplayOrder(displayOrder);
        return resource;
    }
}
