package com.example.socialbackend.collaboration.model;

import com.example.socialbackend.model.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "task_request_join_requests")
public class TaskRequestJoinRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_request_id", nullable = false)
    private TaskRequest taskRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @Column(name = "farm_location", columnDefinition = "text")
    private String farmLocation;

    @Column(name = "farm_location_lat")
    private Double farmLocationLat;

    @Column(name = "farm_location_lng")
    private Double farmLocationLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private JoinRequestStatus status = JoinRequestStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TaskRequest getTaskRequest() { return taskRequest; }
    public void setTaskRequest(TaskRequest taskRequest) { this.taskRequest = taskRequest; }
    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }
    public String getFarmLocation() { return farmLocation; }
    public void setFarmLocation(String farmLocation) { this.farmLocation = farmLocation; }
    public Double getFarmLocationLat() { return farmLocationLat; }
    public void setFarmLocationLat(Double farmLocationLat) { this.farmLocationLat = farmLocationLat; }
    public Double getFarmLocationLng() { return farmLocationLng; }
    public void setFarmLocationLng(Double farmLocationLng) { this.farmLocationLng = farmLocationLng; }
    public JoinRequestStatus getStatus() { return status; }
    public void setStatus(JoinRequestStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
