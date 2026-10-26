package com.example.socialbackend.collaboration.controller;

import com.example.socialbackend.collaboration.model.TaskType;
import com.example.socialbackend.collaboration.service.CollaborationService;
import com.example.socialbackend.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collaboration")
public class CollaborationController {
    private final CollaborationService collab;
    private final Logger logger = LoggerFactory.getLogger(CollaborationController.class);

    public CollaborationController(CollaborationService collab) {
        this.collab = collab;
    }

    @GetMapping("/task-requests/open")
    public ResponseEntity<?> open(org.springframework.security.core.Authentication authentication) {
        User me = requireUser(authentication);
        List<Map<String, Object>> out = collab.listOpenRequests(me);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/task-requests/filled")
    public ResponseEntity<?> filled(org.springframework.security.core.Authentication authentication) {
        User me = requireUser(authentication);
        List<Map<String, Object>> out = collab.listFilledRequests(me);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/task-requests/mine")
    public ResponseEntity<?> mine(org.springframework.security.core.Authentication authentication) {
        User me = requireUser(authentication);
        List<Map<String, Object>> out = collab.listMyRequests(me);
        return ResponseEntity.ok(out);
    }

    @PostMapping("/task-requests")
    public ResponseEntity<?> create(org.springframework.security.core.Authentication authentication, @RequestBody Map<String, Object> body) {
        User me = requireUser(authentication);
        String taskTypeStr = body.get("taskType") == null ? null : String.valueOf(body.get("taskType"));
        TaskType taskType;
        try {
            taskType = taskTypeStr == null ? null : TaskType.valueOf(taskTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid taskType");
        }
        int required;
        int requiredFarmers;
        try {
            required = body.get("requiredFarmerDays") == null ? 0 : Integer.parseInt(String.valueOf(body.get("requiredFarmerDays")));
            requiredFarmers = body.get("requiredFarmers") == null ? 1 : Integer.parseInt(String.valueOf(body.get("requiredFarmers")));
        } catch (NumberFormatException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "requiredFarmerDays/requiredFarmers must be whole numbers");
        }
        LocalDate start;
        LocalDate end;
        try {
            start = body.get("dateWindowStart") == null ? null : LocalDate.parse(String.valueOf(body.get("dateWindowStart")));
            end = body.get("dateWindowEnd") == null ? null : LocalDate.parse(String.valueOf(body.get("dateWindowEnd")));
        } catch (java.time.format.DateTimeParseException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid date format for dateWindowStart/dateWindowEnd");
        }
        Double lat = null;
        Double lng = null;
        try {
            if (body.get("locationLat") != null && !String.valueOf(body.get("locationLat")).isBlank()) {
                lat = Double.valueOf(String.valueOf(body.get("locationLat")));
            }
            if (body.get("locationLng") != null && !String.valueOf(body.get("locationLng")).isBlank()) {
                lng = Double.valueOf(String.valueOf(body.get("locationLng")));
            }
        } catch (NumberFormatException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "locationLat/locationLng must be valid numbers");
        }
        Map<String, Object> out = collab.createTaskRequest(me, taskType, requiredFarmers, required, start, end, lat, lng);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/task-requests/{id}/calendar")
    public ResponseEntity<?> calendar(@PathVariable Long id) {
        return ResponseEntity.ok(collab.getCalendar(id));
    }

    @PostMapping("/task-requests/{id}/join-requests")
    public ResponseEntity<?> requestJoin(org.springframework.security.core.Authentication authentication, @PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        User me = requireUser(authentication);
        String farmLocation = body == null || body.get("farmLocation") == null ? null : String.valueOf(body.get("farmLocation"));
        Double lat = null;
        Double lng = null;
        try {
            if (body != null && body.get("farmLocationLat") != null && !String.valueOf(body.get("farmLocationLat")).isBlank()) {
                lat = Double.valueOf(String.valueOf(body.get("farmLocationLat")));
            }
            if (body != null && body.get("farmLocationLng") != null && !String.valueOf(body.get("farmLocationLng")).isBlank()) {
                lng = Double.valueOf(String.valueOf(body.get("farmLocationLng")));
            }
        } catch (NumberFormatException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "farmLocationLat/farmLocationLng must be valid numbers");
        }
        return ResponseEntity.ok(collab.requestJoin(me, id, farmLocation, lat, lng));
    }

    @GetMapping("/me/personal-tasks")
    public ResponseEntity<?> myPersonalTasks(org.springframework.security.core.Authentication authentication) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.listPersonalTasks(me));
    }

    @PostMapping("/personal-tasks")
    public ResponseEntity<?> createPersonalTask(org.springframework.security.core.Authentication authentication, @RequestBody(required = false) Map<String, Object> body) {
        User me = requireUser(authentication);
        String rawDate = body == null || body.get("dateStr") == null ? null : String.valueOf(body.get("dateStr"));
        String title = body == null || body.get("title") == null ? null : String.valueOf(body.get("title"));
        String time = body == null || body.get("time") == null ? null : String.valueOf(body.get("time"));
        String note = body == null || body.get("note") == null ? null : String.valueOf(body.get("note"));
        LocalDate taskDate;
        try {
            taskDate = rawDate == null ? null : LocalDate.parse(rawDate);
        } catch (java.time.format.DateTimeParseException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid dateStr format");
        }
        return ResponseEntity.ok(collab.createPersonalTask(me, taskDate, title, time, note));
    }

    @DeleteMapping("/personal-tasks/{id}")
    public ResponseEntity<?> deletePersonalTask(org.springframework.security.core.Authentication authentication, @PathVariable Long id) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.deletePersonalTask(me, id));
    }

    @GetMapping("/join-requests/pending")
    public ResponseEntity<?> pendingJoinRequests(org.springframework.security.core.Authentication authentication) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.pendingJoinRequests(me));
    }

    @PostMapping("/join-requests/{id}/approve")
    public ResponseEntity<?> approveJoinRequest(org.springframework.security.core.Authentication authentication, @PathVariable Long id) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.approveJoinRequest(me, id));
    }

    @PostMapping("/join-requests/{id}/reject")
    public ResponseEntity<?> rejectJoinRequest(org.springframework.security.core.Authentication authentication, @PathVariable Long id) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.rejectJoinRequest(me, id));
    }

    @DeleteMapping("/task-requests/{id}")
    public ResponseEntity<?> deleteTaskRequest(org.springframework.security.core.Authentication authentication, @PathVariable Long id) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.deleteTaskRequest(me, id));
    }

    @PostMapping("/task-requests/{id}/bookings")
    public ResponseEntity<?> book(org.springframework.security.core.Authentication authentication, @PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        User me = requireUser(authentication);
        String raw = body == null || body.get("bookingDate") == null ? null : String.valueOf(body.get("bookingDate"));
        logger.info("Booking request received taskRequestId={} bookingDateRaw={} userId={}", id, raw, me.getId());
        LocalDate bookingDate;
        try {
            bookingDate = raw == null ? null : LocalDate.parse(raw);
        } catch (java.time.format.DateTimeParseException ex) {
            logger.warn("Invalid bookingDate format taskRequestId={} bookingDateRaw={} userId={}", id, raw, me.getId());
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid bookingDate format");
        }
        if (bookingDate == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "bookingDate required");
        }
        try {
            return ResponseEntity.ok(collab.book(me, id, bookingDate));
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            logger.warn("Booking failed taskRequestId={} bookingDate={} userId={} status={} reason={}", id, bookingDate, me.getId(), ex.getStatusCode(), ex.getReason());
            throw ex;
        } catch (Exception ex) {
            logger.error("Booking error taskRequestId={} bookingDate={} userId={}", id, bookingDate, me.getId(), ex);
            throw ex;
        }
    }

    @GetMapping("/me/upcoming-work")
    public ResponseEntity<?> myUpcomingWork(org.springframework.security.core.Authentication authentication) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.myUpcomingWork(me));
    }

    @GetMapping("/me/group-schedule")
    public ResponseEntity<?> myGroupSchedule(org.springframework.security.core.Authentication authentication) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.myGroupSchedule(me));
    }

    @PostMapping("/bookings/{id}/confirm")
    public ResponseEntity<?> confirm(org.springframework.security.core.Authentication authentication, @PathVariable Long id) {
        User me = requireUser(authentication);
        return ResponseEntity.ok(collab.confirmCompletion(me, id));
    }

    @PostMapping("/bookings/{id}/dispute")
    public ResponseEntity<?> dispute(org.springframework.security.core.Authentication authentication, @PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        User me = requireUser(authentication);
        String reason = body == null || body.get("reason") == null ? "" : String.valueOf(body.get("reason"));
        return ResponseEntity.ok(collab.dispute(me, id, reason));
    }

    @PostMapping("/bookings/{id}/reschedule")
    public ResponseEntity<?> reschedule(org.springframework.security.core.Authentication authentication, @PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        User me = requireUser(authentication);
        String raw = body == null || body.get("bookingDate") == null ? null : String.valueOf(body.get("bookingDate"));
        LocalDate newDate;
        try {
            newDate = raw == null ? null : LocalDate.parse(raw);
        } catch (java.time.format.DateTimeParseException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid bookingDate format");
        }
        return ResponseEntity.ok(collab.reschedule(me, id, newDate));
    }

    private User requireUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return (User) authentication.getPrincipal();
    }
}
