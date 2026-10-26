package com.example.socialbackend.collaboration.model;

import com.example.socialbackend.model.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
    name = "task_request_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"task_request_id", "user_id"})
)
public class TaskRequestMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_request_id", nullable = false)
    private TaskRequest taskRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TaskRequestMemberRole role = TaskRequestMemberRole.MEMBER;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TaskRequest getTaskRequest() { return taskRequest; }
    public void setTaskRequest(TaskRequest taskRequest) { this.taskRequest = taskRequest; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public TaskRequestMemberRole getRole() { return role; }
    public void setRole(TaskRequestMemberRole role) { this.role = role; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
