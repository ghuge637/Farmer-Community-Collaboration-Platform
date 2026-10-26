
package com.example.socialbackend.repository;

import com.example.socialbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);

    @Query("select count(f) from User u join u.followers f where u.id = :id")
    long countFollowersById(@Param("id") Long id);

    @Query("select count(f) from User u join u.following f where u.id = :id")
    long countFollowingById(@Param("id") Long id);

    @Query("select case when count(f)>0 then true else false end from User u join u.followers f where u.id = :targetId and f.id = :requesterId")
    boolean existsFollower(@Param("targetId") Long targetId, @Param("requesterId") Long requesterId);

    @Query("select f from User u join u.followers f where u.id = :id")
    List<User> findFollowersByUserId(@Param("id") Long id);

    @Query("select f from User u join u.following f where u.id = :id")
    List<User> findFollowingByUserId(@Param("id") Long id);

    // Native modify queries to add/remove join-table entries without loading collections
    @Modifying
    @Transactional
    @Query(value = "insert into user_followers (following_id, follower_id) values (:followingId, :followerId)", nativeQuery = true)
    void addFollower(@Param("followingId") Long followingId, @Param("followerId") Long followerId);

    @Modifying
    @Transactional
    @Query(value = "delete from user_followers where following_id = :followingId and follower_id = :followerId", nativeQuery = true)
    void removeFollower(@Param("followingId") Long followingId, @Param("followerId") Long followerId);
}
