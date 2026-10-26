package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.PersonalTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PersonalTaskRepository extends JpaRepository<PersonalTask, Long> {
    List<PersonalTask> findByUserIdOrderByTaskDateAscCreatedAtAsc(Long userId);

    long deleteByIdAndUserId(Long id, Long userId);
}
