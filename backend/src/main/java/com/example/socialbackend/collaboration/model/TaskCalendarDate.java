package com.example.socialbackend.collaboration.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "task_calendar_dates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"task_request_id", "calendar_date"})
})
public class TaskCalendarDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_request_id", nullable = false)
    private TaskRequest taskRequest;

    @Column(name = "calendar_date", nullable = false)
    private LocalDate calendarDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "date_status", nullable = false, length = 16)
    private CalendarDateStatus dateStatus = CalendarDateStatus.AVAILABLE;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TaskRequest getTaskRequest() { return taskRequest; }
    public void setTaskRequest(TaskRequest taskRequest) { this.taskRequest = taskRequest; }
    public LocalDate getCalendarDate() { return calendarDate; }
    public void setCalendarDate(LocalDate calendarDate) { this.calendarDate = calendarDate; }
    public CalendarDateStatus getDateStatus() { return dateStatus; }
    public void setDateStatus(CalendarDateStatus dateStatus) { this.dateStatus = dateStatus; }
}

