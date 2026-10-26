package com.example.socialbackend.collaboration.model;

import com.example.socialbackend.model.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_request_id", nullable = false)
    private TaskRequest taskRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booked_by", nullable = false)
    private User bookedBy;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "assigned_work_date")
    private LocalDate assignedWorkDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "requester_confirmed", nullable = false)
    private boolean requesterConfirmed = false;

    @Column(name = "worker_confirmed", nullable = false)
    private boolean workerConfirmed = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TaskRequest getTaskRequest() { return taskRequest; }
    public void setTaskRequest(TaskRequest taskRequest) { this.taskRequest = taskRequest; }
    public User getBookedBy() { return bookedBy; }
    public void setBookedBy(User bookedBy) { this.bookedBy = bookedBy; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalDate getAssignedWorkDate() { return assignedWorkDate; }
    public void setAssignedWorkDate(LocalDate assignedWorkDate) { this.assignedWorkDate = assignedWorkDate; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public boolean isRequesterConfirmed() { return requesterConfirmed; }
    public void setRequesterConfirmed(boolean requesterConfirmed) { this.requesterConfirmed = requesterConfirmed; }
    public boolean isWorkerConfirmed() { return workerConfirmed; }
    public void setWorkerConfirmed(boolean workerConfirmed) { this.workerConfirmed = workerConfirmed; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

