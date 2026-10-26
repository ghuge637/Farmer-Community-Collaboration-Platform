package com.example.socialbackend.repository;

import com.example.socialbackend.model.Post;
import com.example.socialbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthorOrderByCreatedAtDesc(User author);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Post p where p.id = :id")
    Optional<Post> findByIdForUpdate(@Param("id") Long id);

    // Return posts ordered newest first
    default List<Post> findAllOrderByCreatedAtDesc() {
        return findAll().stream()
            .sorted(java.util.Comparator.comparing(
                Post::getCreatedAt,
                java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())
            ).reversed())
            .toList();
    }

    // Search posts by caption (case-insensitive)
    List<Post> findByCaptionContainingIgnoreCase(String caption);
} 
