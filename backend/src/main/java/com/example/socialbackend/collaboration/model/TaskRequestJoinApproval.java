package com.example.socialbackend.collaboration.model;

import com.example.socialbackend.model.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
    name = "task_request_join_approvals",
    uniqueConstraints = @UniqueConstraint(columnNames = {"join_request_id", "approver_id"})
)
public class TaskRequestJoinApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "join_request_id", nullable = false)
    private TaskRequestJoinRequest joinRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private JoinDecision decision = JoinDecision.PENDING;

    @Column(name = "decided_at")
    private Instant decidedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TaskRequestJoinRequest getJoinRequest() { return joinRequest; }
    public void setJoinRequest(TaskRequestJoinRequest joinRequest) { this.joinRequest = joinRequest; }
    public User getApprover() { return approver; }
    public void setApprover(User approver) { this.approver = approver; }
    public JoinDecision getDecision() { return decision; }
    public void setDecision(JoinDecision decision) { this.decision = decision; }
    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }
}
