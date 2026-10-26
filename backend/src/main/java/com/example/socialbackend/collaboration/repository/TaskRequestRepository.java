package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.TaskRequest;
import com.example.socialbackend.collaboration.model.TaskRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface TaskRequestRepository extends JpaRepository<TaskRequest, Long> {
    List<TaskRequest> findByStatusOrderByCreatedAtDesc(TaskRequestStatus status);

    List<TaskRequest> findByIdInOrderByCreatedAtDesc(List<Long> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select tr from TaskRequest tr where tr.id = :id")
    Optional<TaskRequest> findByIdForUpdate(@Param("id") Long id);
}
