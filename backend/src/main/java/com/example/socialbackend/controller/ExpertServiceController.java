package com.example.socialbackend.controller;

import com.example.socialbackend.model.ExpertService;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.UserRepository;
import com.example.socialbackend.service.ExpertServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/expert/services")
public class ExpertServiceController {
    private final ExpertServiceService expertServiceService;
    private final UserRepository userRepository;

    public ExpertServiceController(ExpertServiceService expertServiceService, UserRepository userRepository) {
        this.expertServiceService = expertServiceService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody Map<String, Object> body, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        User expert = (User) authentication.getPrincipal();
        if (expert.getRole() != User.Role.EXPERT || !expert.isVerifiedExpert()) {
            return ResponseEntity.status(403).body(Map.of("error", "Only verified experts can create courses"));
        }
        // Validate required fields
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String modeStr = (String) body.get("mode");
        if (title == null || title.isBlank() || description == null || description.isBlank() || modeStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
        }
        ExpertService.Mode mode;
        try {
            mode = ExpertService.Mode.valueOf(modeStr.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid mode"));
        }
        ExpertService service = new ExpertService();
        service.setExpert(expert);
        service.setTitle(title);
        service.setDescription(description);
        service.setMode(mode);
        service.setDuration((String) body.getOrDefault("duration", null));
        service.setPrice((String) body.getOrDefault("price", null));
        service.setContactPhone((String) body.getOrDefault("contactPhone", null));
        service.setContactWhatsApp((String) body.getOrDefault("contactWhatsApp", null));
        service.setContactEmail((String) body.getOrDefault("contactEmail", null));
        service.setEnabled(body.get("enabled") == null ? true : Boolean.TRUE.equals(body.get("enabled")));
        service.setServiceType(ExpertService.ServiceType.COURSE);
        expertServiceService.save(service);
        return ResponseEntity.ok(Map.of("message", "Course created successfully"));
    }

    @GetMapping("/{expertId}")
    public ResponseEntity<?> listCourses(@PathVariable Long expertId) {
        var courses = expertServiceService.getEnabledCoursesByExpertId(expertId);
        var out = courses.stream().map(course -> {
            var m = new java.util.HashMap<String, Object>();
            m.put("id", course.getId());
            m.put("title", course.getTitle());
            m.put("description", course.getDescription());
            m.put("mode", course.getMode());
            m.put("duration", course.getDuration());
            m.put("price", course.getPrice());
            m.put("contactPhone", course.getContactPhone());
            m.put("contactWhatsApp", course.getContactWhatsApp());
            m.put("contactEmail", course.getContactEmail());
            m.put("enabled", course.isEnabled());
            return m;
        }).toList();
        return ResponseEntity.ok(out);
    }
}
