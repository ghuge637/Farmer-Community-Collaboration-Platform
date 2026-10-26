package com.example.socialbackend.collaboration.repository;

import com.example.socialbackend.collaboration.model.Booking;
import com.example.socialbackend.collaboration.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    long countByTaskRequestId(Long taskRequestId);
    boolean existsByTaskRequestIdAndAssignedWorkDate(Long taskRequestId, LocalDate assignedWorkDate);

    boolean existsByBookedByIdAndBookingDate(Long bookedById, LocalDate bookingDate);
    boolean existsByBookedByIdAndAssignedWorkDate(Long bookedById, LocalDate assignedWorkDate);
    long countByTaskRequestIdAndBookedById(Long taskRequestId, Long bookedById);

    @Query("select count(distinct b.bookedBy.id) from Booking b where b.taskRequest.id = :taskRequestId")
    long countDistinctBookedByIdByTaskRequestId(@Param("taskRequestId") Long taskRequestId);

    @Query("select distinct b.taskRequest.id from Booking b where b.bookedBy.id = :bookedById")
    List<Long> findDistinctTaskRequestIdsByBookedById(@Param("bookedById") Long bookedById);

    @Query("select b.bookingDate, b.bookedBy.id, b.bookedBy.name from Booking b where b.taskRequest.id = :taskRequestId")
    List<Object[]> findBookingSummaries(@Param("taskRequestId") Long taskRequestId);

    @Query("select b from Booking b join fetch b.bookedBy join fetch b.taskRequest tr join fetch tr.createdBy where tr.id in :taskRequestIds order by b.bookingDate asc")
    List<Booking> findScheduleBookings(@Param("taskRequestIds") List<Long> taskRequestIds);

    @Modifying
    @Query("delete from Booking b where b.taskRequest.id = :taskRequestId")
    int deleteAllByTaskRequestId(@Param("taskRequestId") Long taskRequestId);

    @Query("select count(b) > 0 from Booking b where b.bookedBy.id = :bookedById and (b.bookingDate = :date or b.assignedWorkDate = :date)")
    boolean existsByBookedByIdAndAnyDate(@Param("bookedById") Long bookedById, @Param("date") LocalDate date);

    @Query("select count(b) > 0 from Booking b where b.bookedBy.id = :bookedById and b.id <> :excludeId and (b.bookingDate = :date or b.assignedWorkDate = :date)")
    boolean existsByBookedByIdAndAnyDateExcluding(@Param("bookedById") Long bookedById, @Param("excludeId") Long excludeId, @Param("date") LocalDate date);

    List<Booking> findByBookedByIdAndStatusInOrderByAssignedWorkDateAsc(Long bookedById, List<BookingStatus> statuses);
    List<Booking> findByTaskRequestIdOrderByAssignedWorkDateAsc(Long taskRequestId);
}
