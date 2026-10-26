package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.JoinRequestStatus;
import com.example.socialbackend.collaboration.model.TaskRequestJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRequestJoinRequestRepository extends JpaRepository<TaskRequestJoinRequest, Long> {
    Optional<TaskRequestJoinRequest> findByTaskRequestIdAndRequestedByIdAndStatus(Long taskRequestId, Long requestedById, JoinRequestStatus status);

    @Query("select jr.taskRequest.id from TaskRequestJoinRequest jr where jr.requestedBy.id = :userId and jr.status = :status and jr.taskRequest.id in :taskRequestIds")
    List<Long> findTaskRequestIdsByRequestedByIdAndStatusIn(@Param("userId") Long userId,
                                                            @Param("status") JoinRequestStatus status,
                                                            @Param("taskRequestIds") List<Long> taskRequestIds);
}
