package com.example.socialbackend.collaboration.service;

import com.example.socialbackend.collaboration.model.*;
import com.example.socialbackend.collaboration.repository.BookingRepository;
import com.example.socialbackend.collaboration.repository.LaborLedgerRepository;
import com.example.socialbackend.collaboration.repository.PersonalTaskRepository;
import com.example.socialbackend.collaboration.repository.TaskCalendarDateRepository;
import com.example.socialbackend.collaboration.repository.TaskRequestJoinApprovalRepository;
import com.example.socialbackend.collaboration.repository.TaskRequestJoinRequestRepository;
import com.example.socialbackend.collaboration.repository.TaskRequestMemberRepository;
import com.example.socialbackend.collaboration.repository.TaskRequestRepository;
import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.time.temporal.ChronoUnit;

@Service
public class CollaborationService {
    private final TaskRequestRepository taskRequests;
    private final TaskCalendarDateRepository calendarDates;
    private final BookingRepository bookings;
    private final LaborLedgerRepository ledger;
    private final TaskRequestMemberRepository members;
    private final TaskRequestJoinRequestRepository joinRequests;
    private final TaskRequestJoinApprovalRepository joinApprovals;
    private final PersonalTaskRepository personalTasks;
    private final UserRepository users;
    private final Logger logger = LoggerFactory.getLogger(CollaborationService.class);

    public CollaborationService(TaskRequestRepository taskRequests,
                                TaskCalendarDateRepository calendarDates,
                                BookingRepository bookings,
                                LaborLedgerRepository ledger,
                                TaskRequestMemberRepository members,
                                TaskRequestJoinRequestRepository joinRequests,
                                TaskRequestJoinApprovalRepository joinApprovals,
                                PersonalTaskRepository personalTasks,
                                UserRepository users) {
        this.taskRequests = taskRequests;
        this.calendarDates = calendarDates;
        this.bookings = bookings;
        this.ledger = ledger;
        this.members = members;
        this.joinRequests = joinRequests;
        this.joinApprovals = joinApprovals;
        this.personalTasks = personalTasks;
        this.users = users;
    }

    @Transactional
    public Map<String, Object> createTaskRequest(User me,
                                                 TaskType taskType,
                                                 int requiredFarmers,
                                                 int requiredFarmerDays,
                                                 LocalDate windowStart,
                                                 LocalDate windowEnd,
                                                 Double lat,
                                                 Double lng) {
        if (taskType == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "task_type required");
        if (requiredFarmers <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "required_farmers must be > 0");
        if (requiredFarmerDays <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "required_farmer_days must be > 0");
        if (windowStart == null || windowEnd == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date window is required");
        if (windowEnd.isBefore(windowStart)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date_window_end must be >= date_window_start");
        long windowDays = ChronoUnit.DAYS.between(windowStart, windowEnd) + 1;
        long totalNeeded = (long) requiredFarmers * (long) requiredFarmerDays;
        if (windowDays < totalNeeded) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date window too small for required farmers x days");
        }

        TaskRequest tr = new TaskRequest();
        tr.setCreatedBy(me);
        tr.setTaskType(taskType);
        tr.setRequiredFarmerDays(requiredFarmerDays);
        tr.setRequiredFarmers(requiredFarmers);
        tr.setDateWindowStart(windowStart);
        tr.setDateWindowEnd(windowEnd);
        tr.setLocationLat(lat);
        tr.setLocationLng(lng);
        tr.setStatus(TaskRequestStatus.OPEN);
        tr = taskRequests.save(tr);

        TaskRequestMember ownerMember = new TaskRequestMember();
        ownerMember.setTaskRequest(tr);
        ownerMember.setUser(me);
        ownerMember.setRole(TaskRequestMemberRole.OWNER);
        members.save(ownerMember);

        // Generate TaskCalendar (all dates in window as AVAILABLE)
        LocalDate d = windowStart;
        while (!d.isAfter(windowEnd)) {
            TaskCalendarDate cd = new TaskCalendarDate();
            cd.setTaskRequest(tr);
            cd.setCalendarDate(d);
            cd.setDateStatus(CalendarDateStatus.AVAILABLE);
            calendarDates.save(cd);
            d = d.plusDays(1);
        }

        return taskRequestToDto(tr);
    }

    public List<Map<String, Object>> listOpenRequests(User me) {
        List<TaskRequest> list = taskRequests.findByStatusOrderByCreatedAtDesc(TaskRequestStatus.OPEN);
        return toDtosWithUser(list, me);
    }

    public List<Map<String, Object>> listFilledRequests(User me) {
        List<TaskRequest> list = taskRequests.findByStatusOrderByCreatedAtDesc(TaskRequestStatus.FILLED);
        return toDtosWithUser(list, me);
    }

    public List<Map<String, Object>> listMyRequests(User me) {
        List<Long> taskRequestIds = members.findTaskRequestIdsByUserId(me.getId());
        if (taskRequestIds.isEmpty()) return List.of();
        List<TaskRequest> list = taskRequests.findByIdInOrderByCreatedAtDesc(taskRequestIds).stream()
            .filter(tr -> tr.getStatus() == TaskRequestStatus.OPEN || tr.getStatus() == TaskRequestStatus.FILLED)
            .toList();
        return toDtosWithUser(list, me);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCalendar(Long taskRequestId) {
        Map<String, Map<String, Object>> bookedByByDate = new HashMap<>();
        for (Object[] row : bookings.findBookingSummaries(taskRequestId)) {
            if (row == null || row.length < 3) continue;
            LocalDate bookingDate = (LocalDate) row[0];
            Long bookedById = (Long) row[1];
            String bookedByName = (String) row[2];
            if (bookingDate == null || bookedById == null) continue;
            String displayName = bookedByName;
            if (displayName == null || displayName.isBlank()) {
                displayName = "#" + bookedById;
            }
            bookedByByDate.put(bookingDate.toString(), Map.of(
                "id", bookedById,
                "name", displayName
            ));
        }

        return calendarDates.findByTaskRequestIdOrderByCalendarDateAsc(taskRequestId).stream()
            .map(d -> {
                Map<String, Object> m = new HashMap<>();
                String dateStr = d.getCalendarDate().toString();
                m.put("date", dateStr);
                m.put("status", d.getDateStatus().name());
                if (d.getDateStatus() == CalendarDateStatus.BOOKED) {
                    Map<String, Object> bookedBy = bookedByByDate.get(dateStr);
                    if (bookedBy != null) m.put("bookedBy", bookedBy);
                }
                return m;
            }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listPersonalTasks(User me) {
        return personalTasks.findByUserIdOrderByTaskDateAscCreatedAtAsc(me.getId()).stream()
            .map(this::personalTaskToDto)
            .toList();
    }

    @Transactional
    public Map<String, Object> createPersonalTask(User me, LocalDate taskDate, String title, String time, String note) {
        if (taskDate == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "taskDate required");
        String cleanedTitle = title == null ? "" : title.trim();
        if (cleanedTitle.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");

        PersonalTask task = new PersonalTask();
        task.setUser(me);
        task.setTaskDate(taskDate);
        task.setTitle(cleanedTitle);
        task.setTime(time == null ? null : time.trim());
        task.setNote(note == null ? null : note.trim());
        task = personalTasks.save(task);
        return personalTaskToDto(task);
    }

    @Transactional
    public Map<String, Object> deletePersonalTask(User me, Long taskId) {
        long deleted = personalTasks.deleteByIdAndUserId(taskId, me.getId());
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
        Map<String, Object> out = new HashMap<>();
        out.put("id", taskId);
        out.put("deleted", true);
        return out;
    }

    @Transactional
    public Map<String, Object> requestJoin(User me, Long taskRequestId, String farmLocation, Double farmLocationLat, Double farmLocationLng) {
        if (farmLocationLat == null || farmLocationLng == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "farm_location_lat/farm_location_lng required");
        }
        String location = farmLocation == null ? "" : farmLocation.trim();

        TaskRequest tr = taskRequests.findByIdForUpdate(taskRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TaskRequest not found"));
        if (tr.getStatus() != TaskRequestStatus.OPEN) throw new ResponseStatusException(HttpStatus.CONFLICT, "TaskRequest not open");
        if (members.existsByTaskRequestIdAndUserId(tr.getId(), me.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already a member");
        }
        if (joinRequests.findByTaskRequestIdAndRequestedByIdAndStatus(tr.getId(), me.getId(), JoinRequestStatus.PENDING).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Join request already pending");
        }

        TaskRequestJoinRequest jr = new TaskRequestJoinRequest();
        jr.setTaskRequest(tr);
        jr.setRequestedBy(me);
        jr.setFarmLocation(location.isBlank() ? null : location);
        jr.setFarmLocationLat(farmLocationLat);
        jr.setFarmLocationLng(farmLocationLng);
        jr.setStatus(JoinRequestStatus.PENDING);
        jr = joinRequests.save(jr);

        List<TaskRequestMember> approvers = members.findByTaskRequestId(tr.getId());
        if (approvers.isEmpty() && tr.getCreatedBy() != null) {
            TaskRequestMember ownerMember = new TaskRequestMember();
            ownerMember.setTaskRequest(tr);
            ownerMember.setUser(tr.getCreatedBy());
            ownerMember.setRole(TaskRequestMemberRole.OWNER);
            members.save(ownerMember);
            approvers = List.of(ownerMember);
        }

        for (TaskRequestMember m : approvers) {
            TaskRequestJoinApproval approval = new TaskRequestJoinApproval();
            approval.setJoinRequest(jr);
            approval.setApprover(m.getUser());
            approval.setDecision(JoinDecision.PENDING);
            joinApprovals.save(approval);
        }

        return joinRequestToDto(jr);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> pendingJoinRequests(User me) {
        List<TaskRequestJoinApproval> approvals = joinApprovals.findPendingApprovals(me.getId(), JoinDecision.PENDING, JoinRequestStatus.PENDING);
        Map<Long, TaskRequestJoinRequest> byId = new HashMap<>();
        for (TaskRequestJoinApproval a : approvals) {
            TaskRequestJoinRequest jr = a.getJoinRequest();
            if (jr != null) {
                byId.putIfAbsent(jr.getId(), jr);
            }
        }
        return byId.values().stream().map(this::joinRequestToDto).toList();
    }

    @Transactional
    public Map<String, Object> approveJoinRequest(User me, Long joinRequestId) {
        return respondToJoinRequest(me, joinRequestId, true);
    }

    @Transactional
    public Map<String, Object> rejectJoinRequest(User me, Long joinRequestId) {
        return respondToJoinRequest(me, joinRequestId, false);
    }

    private Map<String, Object> respondToJoinRequest(User me, Long joinRequestId, boolean approve) {
        TaskRequestJoinRequest jr = joinRequests.findById(joinRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Join request not found"));
        if (jr.getStatus() != JoinRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Join request already decided");
        }
        TaskRequestJoinApproval approval = joinApprovals.findByJoinRequestIdAndApproverId(jr.getId(), me.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not an approver"));
        if (approval.getDecision() != JoinDecision.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already responded");
        }

        approval.setDecision(approve ? JoinDecision.APPROVED : JoinDecision.REJECTED);
        approval.setDecidedAt(java.time.Instant.now());
        joinApprovals.save(approval);

        if (!approve) {
            jr.setStatus(JoinRequestStatus.REJECTED);
            joinRequests.save(jr);
            return joinRequestToDto(jr);
        }

        List<TaskRequestJoinApproval> allApprovals = joinApprovals.findByJoinRequestId(jr.getId());
        boolean anyRejected = allApprovals.stream().anyMatch(a -> a.getDecision() == JoinDecision.REJECTED);
        long approvedCount = allApprovals.stream().filter(a -> a.getDecision() == JoinDecision.APPROVED).count();
        if (anyRejected) {
            jr.setStatus(JoinRequestStatus.REJECTED);
            joinRequests.save(jr);
            return joinRequestToDto(jr);
        }
        if (approvedCount == allApprovals.size()) {
            jr.setStatus(JoinRequestStatus.APPROVED);
            joinRequests.save(jr);
            if (!members.existsByTaskRequestIdAndUserId(jr.getTaskRequest().getId(), jr.getRequestedBy().getId())) {
                TaskRequestMember member = new TaskRequestMember();
                member.setTaskRequest(jr.getTaskRequest());
                member.setUser(jr.getRequestedBy());
                member.setRole(TaskRequestMemberRole.MEMBER);
                members.save(member);
            }
        }
        return joinRequestToDto(jr);
    }

    @Transactional
    public Map<String, Object> deleteTaskRequest(User me, Long taskRequestId) {
        TaskRequest tr = taskRequests.findByIdForUpdate(taskRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TaskRequest not found"));

        boolean isAdmin = me != null && me.getRole() == User.Role.ADMIN;
        Long creatorId = tr.getCreatedBy() != null ? tr.getCreatedBy().getId() : null;
        if (!isAdmin && (creatorId == null || !creatorId.equals(me.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this request");
        }

        try {
            // Remove related data first to avoid FK violations and fully clean up request data.
            ledger.deleteAllByTaskRequestId(tr.getId());
            bookings.deleteAllByTaskRequestId(tr.getId());
            calendarDates.deleteAllByTaskRequestId(tr.getId());
            taskRequests.delete(tr);
            taskRequests.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Delete failed due to related data");
        }
        Map<String, Object> out = new HashMap<>();
        out.put("id", taskRequestId);
        out.put("deleted", true);
        return out;
    }

    @Transactional
    public Map<String, Object> book(User me, Long taskRequestId, LocalDate bookingDate) {
        if (bookingDate == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "booking_date required");

        TaskRequest tr = taskRequests.findByIdForUpdate(taskRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TaskRequest not found"));

        if (tr.getStatus() != TaskRequestStatus.OPEN) throw new ResponseStatusException(HttpStatus.CONFLICT, "TaskRequest not open");
        if (!members.existsByTaskRequestIdAndUserId(tr.getId(), me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Join request not approved");
        }
        if (bookingDate.isBefore(tr.getDateWindowStart()) || bookingDate.isAfter(tr.getDateWindowEnd())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "booking_date outside allowed window");
        }
        if (bookings.existsByBookedByIdAndAnyDate(me.getId(), bookingDate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a booking or workday on this date");
        }

        int requiredFarmers = tr.getRequiredFarmers() <= 0 ? 1 : tr.getRequiredFarmers();
        int daysPerFarmer = tr.getRequiredFarmerDays() <= 0 ? 1 : tr.getRequiredFarmerDays();
        long totalNeeded = (long) requiredFarmers * (long) daysPerFarmer;

        long existing = bookings.countByTaskRequestId(tr.getId());
        if (existing >= totalNeeded) {
            closeCalendarAsFilled(tr);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "TaskRequest already filled");
        }

        long myBooked = bookings.countByTaskRequestIdAndBookedById(tr.getId(), me.getId());
        if (myBooked >= daysPerFarmer) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already booked the maximum days for this request");
        }

        long distinctFarmers = bookings.countDistinctBookedByIdByTaskRequestId(tr.getId());
        boolean isNewFarmer = myBooked == 0;
        if (isNewFarmer && distinctFarmers >= requiredFarmers) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Farmer limit reached for this request");
        }

        TaskCalendarDate cd = calendarDates.findForUpdate(tr.getId(), bookingDate)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar date not found"));
        if (cd.getDateStatus() != CalendarDateStatus.AVAILABLE) throw new ResponseStatusException(HttpStatus.CONFLICT, "Date not available");

        // Allow booking your own request, but enforce one-day-one-work rule.

        // Lock the chosen booking date (commitment)
        cd.setDateStatus(CalendarDateStatus.BOOKED);
        calendarDates.save(cd);

        // Workday is chosen by the farmer (booking date).
        if (bookings.existsByTaskRequestIdAndAssignedWorkDate(tr.getId(), bookingDate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Workday already taken");
        }
        LocalDate assigned = bookingDate;

        Booking b = new Booking();
        b.setTaskRequest(tr);
        b.setBookedBy(me);
        b.setBookingDate(bookingDate);
        b.setAssignedWorkDate(assigned);
        b.setStatus(BookingStatus.PENDING);

        try {
            // Flush to surface any constraint violations inside this try/catch
            b = bookings.saveAndFlush(b);
        } catch (DataIntegrityViolationException e) {
            logger.warn("Booking save failed taskRequestId={} bookedBy={} bookingDate={} assignedWorkDate={} message={}",
                tr.getId(),
                me.getId(),
                bookingDate,
                assigned,
                e.getMessage());
            // Unique constraints enforce: no overlapping commitments & no double-workday assignment
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Overlapping commitment/workday detected");
        }

        LaborLedger ll = new LaborLedger();
        ll.setBooking(b);
        ll.setFromFarmer(me);
        ll.setToFarmer(tr.getCreatedBy());
        ll.setLaborDays(1);
        ll.setStatus(LedgerStatus.OWED);
        ledger.save(ll);

        long nowCount = bookings.countByTaskRequestId(tr.getId());
        if (nowCount >= totalNeeded) {
            closeCalendarAsFilled(tr);
        }

        return bookingToDto(b);
    }

    @Transactional
    public Map<String, Object> confirmCompletion(User me, Long bookingId) {
        Booking b = bookings.findById(bookingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (b.getStatus() != BookingStatus.PENDING) throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking not pending");

        Long workerId = b.getBookedBy() != null ? b.getBookedBy().getId() : null;
        Long requesterId = b.getTaskRequest() != null && b.getTaskRequest().getCreatedBy() != null ? b.getTaskRequest().getCreatedBy().getId() : null;
        if (workerId == null || requesterId == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking missing participants");

        if (me.getId().equals(workerId)) b.setWorkerConfirmed(true);
        else if (me.getId().equals(requesterId)) b.setRequesterConfirmed(true);
        else throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant");

        bookings.save(b);

        if (b.isRequesterConfirmed() && b.isWorkerConfirmed()) {
            b.setStatus(BookingStatus.COMPLETED);
            bookings.save(b);

            LaborLedger ll = ledger.findByBookingId(b.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Ledger missing"));
            if (ll.getStatus() != LedgerStatus.SETTLED) {
                ll.setStatus(LedgerStatus.SETTLED);
                ll.setSettledAt(java.time.Instant.now());
                ledger.save(ll);

                // Credits: worker +1, requester -1
                User worker = users.findById(workerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Worker missing"));
                User requester = users.findById(requesterId).orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Requester missing"));
                worker.setLaborCreditBalance(worker.getLaborCreditBalance() + 1);
                requester.setLaborCreditBalance(requester.getLaborCreditBalance() - 1);
                users.save(worker);
                users.save(requester);
            }

            // Mark request COMPLETED once all bookings are completed.
            TaskRequest tr = taskRequests.findByIdForUpdate(b.getTaskRequest().getId()).orElse(null);
            if (tr != null) {
                boolean allCompleted = bookings.findByTaskRequestIdOrderByAssignedWorkDateAsc(tr.getId()).stream()
                    .allMatch(x -> x.getStatus() == BookingStatus.COMPLETED);
                if (allCompleted) {
                    tr.setStatus(TaskRequestStatus.COMPLETED);
                    taskRequests.save(tr);
                }
            }
        }

        return bookingToDto(b);
    }

    @Transactional
    public Map<String, Object> dispute(User me, Long bookingId, String reason) {
        Booking b = bookings.findById(bookingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (b.getStatus() == BookingStatus.COMPLETED) throw new ResponseStatusException(HttpStatus.CONFLICT, "Already completed");

        Long workerId = b.getBookedBy() != null ? b.getBookedBy().getId() : null;
        Long requesterId = b.getTaskRequest() != null && b.getTaskRequest().getCreatedBy() != null ? b.getTaskRequest().getCreatedBy().getId() : null;
        if (workerId == null || requesterId == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking missing participants");
        if (!me.getId().equals(workerId) && !me.getId().equals(requesterId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant");

        b.setStatus(BookingStatus.DISPUTED);
        bookings.save(b);
        // Credits remain unchanged until resolution (out of scope for v1)

        Map<String, Object> out = bookingToDto(b);
        out.put("reason", reason == null ? "" : reason);
        return out;
    }

    @Transactional
    public Map<String, Object> reschedule(User me, Long bookingId, LocalDate newDate) {
        Booking b = bookings.findById(bookingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (b.getStatus() != BookingStatus.PENDING) throw new ResponseStatusException(HttpStatus.CONFLICT, "Only pending bookings can be rescheduled");

        Long workerId = b.getBookedBy() != null ? b.getBookedBy().getId() : null;
        Long requesterId = b.getTaskRequest() != null && b.getTaskRequest().getCreatedBy() != null ? b.getTaskRequest().getCreatedBy().getId() : null;
        if (workerId == null || requesterId == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking missing participants");
        if (!me.getId().equals(workerId) && !me.getId().equals(requesterId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant");

        TaskRequest tr = taskRequests.findById(b.getTaskRequest().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "TaskRequest missing"));
        if (newDate == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bookingDate required");
        if (newDate.isBefore(tr.getDateWindowStart()) || newDate.isAfter(tr.getDateWindowEnd())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bookingDate outside allowed window");
        }
        if (bookings.existsByBookedByIdAndAnyDateExcluding(workerId, b.getId(), newDate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a booking or workday on this date");
        }

        LocalDate oldDate = b.getBookingDate() != null ? b.getBookingDate() : b.getAssignedWorkDate();
        if (oldDate != null && oldDate.equals(newDate)) {
            return bookingToDto(b);
        }

        TaskCalendarDate newCd = calendarDates.findForUpdate(tr.getId(), newDate)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar date not found"));
        if (newCd.getDateStatus() == CalendarDateStatus.BOOKED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Date not available");
        }

        if (oldDate != null) {
            TaskCalendarDate oldCd = calendarDates.findForUpdate(tr.getId(), oldDate).orElse(null);
            if (oldCd != null) {
                oldCd.setDateStatus(tr.getStatus() == TaskRequestStatus.FILLED ? CalendarDateStatus.FILLED : CalendarDateStatus.AVAILABLE);
                calendarDates.save(oldCd);
            }
        }

        newCd.setDateStatus(CalendarDateStatus.BOOKED);
        calendarDates.save(newCd);

        b.setBookingDate(newDate);
        b.setAssignedWorkDate(newDate);
        b.setRequesterConfirmed(false);
        b.setWorkerConfirmed(false);
        bookings.save(b);

        return bookingToDto(b);
    }

    public List<Map<String, Object>> myUpcomingWork(User me) {
        return bookings.findByBookedByIdAndStatusInOrderByAssignedWorkDateAsc(me.getId(), List.of(BookingStatus.PENDING, BookingStatus.DISPUTED)).stream()
            .map(this::bookingToDto)
            .toList();
    }

    public List<Map<String, Object>> myGroupSchedule(User me) {
        List<Long> taskRequestIds = members.findTaskRequestIdsByUserId(me.getId());
        if (taskRequestIds.isEmpty()) return List.of();
        return bookings.findScheduleBookings(taskRequestIds).stream()
            .map(b -> {
                Map<String, Object> m = bookingToDto(b);
                LocalDate d = b.getBookingDate() != null ? b.getBookingDate() : b.getAssignedWorkDate();
                m.put("date", d != null ? d.toString() : null);
                return m;
            })
            .toList();
    }

    private void closeCalendarAsFilled(TaskRequest tr) {
        // Mark any remaining AVAILABLE dates as FILLED so no new commitments can be made.
        List<TaskCalendarDate> dates = calendarDates.findByTaskRequestIdOrderByCalendarDateAsc(tr.getId());
        for (TaskCalendarDate d : dates) {
            if (d.getDateStatus() == CalendarDateStatus.AVAILABLE) {
                d.setDateStatus(CalendarDateStatus.FILLED);
                calendarDates.save(d);
            }
        }
        tr.setStatus(TaskRequestStatus.FILLED);
        taskRequests.save(tr);
    }

    private List<Map<String, Object>> toDtosWithUser(List<TaskRequest> list, User me) {
        if (list == null || list.isEmpty()) return List.of();
        if (me == null) {
            return list.stream().map(this::taskRequestToDto).toList();
        }
        List<Long> taskRequestIds = list.stream().map(TaskRequest::getId).toList();
        Set<Long> memberRequestIds = new HashSet<>(members.findTaskRequestIdsByUserId(me.getId()));
        Set<Long> pendingJoinRequestIds = new HashSet<>();
        if (!taskRequestIds.isEmpty()) {
            pendingJoinRequestIds.addAll(
                joinRequests.findTaskRequestIdsByRequestedByIdAndStatusIn(me.getId(), JoinRequestStatus.PENDING, taskRequestIds)
            );
        }
        return list.stream()
            .map(tr -> taskRequestToDto(tr, memberRequestIds.contains(tr.getId()), pendingJoinRequestIds.contains(tr.getId())))
            .toList();
    }

    private Map<String, Object> taskRequestToDto(TaskRequest tr) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", tr.getId());
        m.put("taskType", tr.getTaskType() != null ? tr.getTaskType().name() : null);
        m.put("requiredFarmerDays", tr.getRequiredFarmerDays());
        m.put("requiredFarmers", tr.getRequiredFarmers());
        m.put("totalRequiredFarmerDays", tr.getRequiredFarmerDays() * Math.max(1, tr.getRequiredFarmers()));
        m.put("dateWindowStart", tr.getDateWindowStart() != null ? tr.getDateWindowStart().toString() : null);
        m.put("dateWindowEnd", tr.getDateWindowEnd() != null ? tr.getDateWindowEnd().toString() : null);
        m.put("locationLat", tr.getLocationLat());
        m.put("locationLng", tr.getLocationLng());
        m.put("status", tr.getStatus() != null ? tr.getStatus().name() : null);
        if (tr.getCreatedBy() != null) {
            Map<String, Object> createdBy = new HashMap<>();
            createdBy.put("id", tr.getCreatedBy().getId());
            String name = tr.getCreatedBy().getName();
            if (name == null || name.isBlank()) {
                name = "#" + tr.getCreatedBy().getId();
            }
            createdBy.put("name", name);
            m.put("createdBy", createdBy);
        }
        return m;
    }

    private Map<String, Object> taskRequestToDto(TaskRequest tr, boolean isMember, boolean hasPendingJoinRequest) {
        Map<String, Object> m = taskRequestToDto(tr);
        m.put("isMember", isMember);
        if (hasPendingJoinRequest) {
            m.put("joinRequestStatus", JoinRequestStatus.PENDING.name());
        }
        return m;
    }

    private Map<String, Object> joinRequestToDto(TaskRequestJoinRequest jr) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", jr.getId());
        TaskRequest tr = jr.getTaskRequest();
        if (tr != null) {
            m.put("taskRequestId", tr.getId());
            m.put("taskType", tr.getTaskType() != null ? tr.getTaskType().name() : null);
        }
        if (jr.getRequestedBy() != null) {
            Map<String, Object> requestedBy = new HashMap<>();
            requestedBy.put("id", jr.getRequestedBy().getId());
            String name = jr.getRequestedBy().getName();
            if (name == null || name.isBlank()) {
                name = "#" + jr.getRequestedBy().getId();
            }
            requestedBy.put("name", name);
            m.put("requestedBy", requestedBy);
        }
        m.put("farmLocation", jr.getFarmLocation());
        m.put("farmLocationLat", jr.getFarmLocationLat());
        m.put("farmLocationLng", jr.getFarmLocationLng());
        m.put("status", jr.getStatus() != null ? jr.getStatus().name() : null);
        m.put("createdAt", jr.getCreatedAt() != null ? jr.getCreatedAt().toString() : null);

        List<TaskRequestJoinApproval> approvals = joinApprovals.findByJoinRequestId(jr.getId());
        long approved = approvals.stream().filter(a -> a.getDecision() == JoinDecision.APPROVED).count();
        long rejected = approvals.stream().filter(a -> a.getDecision() == JoinDecision.REJECTED).count();
        m.put("approvedCount", approved);
        m.put("rejectedCount", rejected);
        m.put("requiredCount", approvals.size());
        return m;
    }

    private Map<String, Object> bookingToDto(Booking b) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", b.getId());
        m.put("taskRequestId", b.getTaskRequest() != null ? b.getTaskRequest().getId() : null);
        if (b.getBookedBy() != null) {
            Map<String, Object> bookedBy = new HashMap<>();
            bookedBy.put("id", b.getBookedBy().getId());
            String name = b.getBookedBy().getName();
            if (name == null || name.isBlank()) {
                name = "#" + b.getBookedBy().getId();
            }
            bookedBy.put("name", name);
            m.put("bookedBy", bookedBy);
        } else {
            m.put("bookedBy", null);
        }
        if (b.getTaskRequest() != null && b.getTaskRequest().getCreatedBy() != null) {
            Map<String, Object> requester = new HashMap<>();
            requester.put("id", b.getTaskRequest().getCreatedBy().getId());
            String name = b.getTaskRequest().getCreatedBy().getName();
            if (name == null || name.isBlank()) {
                name = "#" + b.getTaskRequest().getCreatedBy().getId();
            }
            requester.put("name", name);
            m.put("requester", requester);
        }
        m.put("bookingDate", b.getBookingDate() != null ? b.getBookingDate().toString() : null);
        m.put("assignedWorkDate", b.getAssignedWorkDate() != null ? b.getAssignedWorkDate().toString() : null);
        m.put("status", b.getStatus() != null ? b.getStatus().name() : null);
        m.put("requesterConfirmed", b.isRequesterConfirmed());
        m.put("workerConfirmed", b.isWorkerConfirmed());
        return m;
    }

    private Map<String, Object> personalTaskToDto(PersonalTask t) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", t.getId());
        m.put("dateStr", t.getTaskDate() != null ? t.getTaskDate().toString() : null);
        m.put("title", t.getTitle());
        m.put("time", t.getTime());
        m.put("note", t.getNote());
        m.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
        return m;
    }
}
