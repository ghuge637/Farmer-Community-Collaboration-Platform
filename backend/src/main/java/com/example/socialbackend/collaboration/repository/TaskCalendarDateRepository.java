package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.TaskCalendarDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskCalendarDateRepository extends JpaRepository<TaskCalendarDate, Long> {
    List<TaskCalendarDate> findByTaskRequestIdOrderByCalendarDateAsc(Long taskRequestId);

    @Modifying
    @Query("delete from TaskCalendarDate d where d.taskRequest.id = :taskRequestId")
    int deleteAllByTaskRequestId(@Param("taskRequestId") Long taskRequestId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from TaskCalendarDate d where d.taskRequest.id = :taskRequestId and d.calendarDate = :calendarDate")
    Optional<TaskCalendarDate> findForUpdate(@Param("taskRequestId") Long taskRequestId, @Param("calendarDate") LocalDate calendarDate);
}
