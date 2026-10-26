package com.example.socialbackend.collaboration.model;

import com.example.socialbackend.model.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "task_requests")
public class TaskRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 32)
    private TaskType taskType;

    @Column(name = "required_farmer_days", nullable = false)
    private int requiredFarmerDays;

    @Column(name = "required_farmers", nullable = false)
    private int requiredFarmers = 1;

    @Column(name = "date_window_start", nullable = false)
    private LocalDate dateWindowStart;

    @Column(name = "date_window_end", nullable = false)
    private LocalDate dateWindowEnd;

    @Column(name = "location_lat")
    private Double locationLat;

    @Column(name = "location_lng")
    private Double locationLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TaskRequestStatus status = TaskRequestStatus.OPEN;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public TaskType getTaskType() { return taskType; }
    public void setTaskType(TaskType taskType) { this.taskType = taskType; }
    public int getRequiredFarmerDays() { return requiredFarmerDays; }
    public void setRequiredFarmerDays(int requiredFarmerDays) { this.requiredFarmerDays = requiredFarmerDays; }
    public int getRequiredFarmers() { return requiredFarmers; }
    public void setRequiredFarmers(int requiredFarmers) { this.requiredFarmers = requiredFarmers; }
    public LocalDate getDateWindowStart() { return dateWindowStart; }
    public void setDateWindowStart(LocalDate dateWindowStart) { this.dateWindowStart = dateWindowStart; }
    public LocalDate getDateWindowEnd() { return dateWindowEnd; }
    public void setDateWindowEnd(LocalDate dateWindowEnd) { this.dateWindowEnd = dateWindowEnd; }
    public Double getLocationLat() { return locationLat; }
    public void setLocationLat(Double locationLat) { this.locationLat = locationLat; }
    public Double getLocationLng() { return locationLng; }
    public void setLocationLng(Double locationLng) { this.locationLng = locationLng; }
    public TaskRequestStatus getStatus() { return status; }
    public void setStatus(TaskRequestStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
