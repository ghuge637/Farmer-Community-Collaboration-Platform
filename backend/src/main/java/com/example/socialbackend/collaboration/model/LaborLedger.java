package com.example.socialbackend.collaboration.model;

import com.example.socialbackend.model.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "labor_ledger")
public class LaborLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "from_farmer", nullable = false)
    private User fromFarmer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "to_farmer", nullable = false)
    private User toFarmer;

    @Column(name = "labor_days", nullable = false)
    private int laborDays = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private LedgerStatus status = LedgerStatus.OWED;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "settled_at")
    private Instant settledAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
    public User getFromFarmer() { return fromFarmer; }
    public void setFromFarmer(User fromFarmer) { this.fromFarmer = fromFarmer; }
    public User getToFarmer() { return toFarmer; }
    public void setToFarmer(User toFarmer) { this.toFarmer = toFarmer; }
    public int getLaborDays() { return laborDays; }
    public void setLaborDays(int laborDays) { this.laborDays = laborDays; }
    public LedgerStatus getStatus() { return status; }
    public void setStatus(LedgerStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getSettledAt() { return settledAt; }
    public void setSettledAt(Instant settledAt) { this.settledAt = settledAt; }
}

