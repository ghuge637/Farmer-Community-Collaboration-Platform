package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.JoinDecision;
import com.example.socialbackend.collaboration.model.JoinRequestStatus;
import com.example.socialbackend.collaboration.model.TaskRequestJoinApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRequestJoinApprovalRepository extends JpaRepository<TaskRequestJoinApproval, Long> {
    Optional<TaskRequestJoinApproval> findByJoinRequestIdAndApproverId(Long joinRequestId, Long approverId);

    List<TaskRequestJoinApproval> findByJoinRequestId(Long joinRequestId);

    @Query("select a from TaskRequestJoinApproval a " +
        "join fetch a.joinRequest jr " +
        "join fetch jr.taskRequest tr " +
        "join fetch jr.requestedBy rb " +
        "where a.approver.id = :approverId and a.decision = :decision and jr.status = :status " +
        "order by jr.createdAt desc")
    List<TaskRequestJoinApproval> findPendingApprovals(@Param("approverId") Long approverId,
                                                       @Param("decision") JoinDecision decision,
                                                       @Param("status") JoinRequestStatus status);
}
