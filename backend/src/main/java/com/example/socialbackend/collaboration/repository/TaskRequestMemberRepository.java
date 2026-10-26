package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.TaskRequestMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRequestMemberRepository extends JpaRepository<TaskRequestMember, Long> {
    boolean existsByTaskRequestIdAndUserId(Long taskRequestId, Long userId);

    List<TaskRequestMember> findByTaskRequestId(Long taskRequestId);

    @Query("select m.taskRequest.id from TaskRequestMember m where m.user.id = :userId")
    List<Long> findTaskRequestIdsByUserId(@Param("userId") Long userId);
}
