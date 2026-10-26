package com.example.socialbackend.repository;

import com.example.socialbackend.model.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemeRepository extends JpaRepository<Scheme, Long> {
    List<Scheme> findByCategory(String category);
    List<Scheme> findByLevel(String level);
}
