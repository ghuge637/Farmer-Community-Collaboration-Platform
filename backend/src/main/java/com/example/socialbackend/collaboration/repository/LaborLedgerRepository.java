package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.LaborLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LaborLedgerRepository extends JpaRepository<LaborLedger, Long> {
    Optional<LaborLedger> findByBookingId(Long bookingId);

    @Modifying
    @Query("delete from LaborLedger l where l.booking.id in (select b.id from Booking b where b.taskRequest.id = :taskRequestId)")
    int deleteAllByTaskRequestId(@Param("taskRequestId") Long taskRequestId);
}
