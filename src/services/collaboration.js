import api from './api'

export function listOpenTaskRequests() {
  return api.get('/collaboration/task-requests/open')
}

export function listFilledTaskRequests() {
  return api.get('/collaboration/task-requests/filled')
}

export function listMyTaskRequests() {
  return api.get('/collaboration/task-requests/mine')
}

export function createTaskRequest(payload) {
  return api.post('/collaboration/task-requests', payload)
}

export function getTaskCalendar(taskRequestId) {
  return api.get(`/collaboration/task-requests/${taskRequestId}/calendar`)
}

export function listPersonalTasks() {
  return api.get('/collaboration/me/personal-tasks')
}

export function createPersonalTask(payload) {
  return api.post('/collaboration/personal-tasks', payload)
}

export function deletePersonalTask(taskId) {
  return api.del(`/collaboration/personal-tasks/${taskId}`)
}

export function requestJoin(taskRequestId, farmLocationLat, farmLocationLng, farmLocation) {
  return api.post(`/collaboration/task-requests/${taskRequestId}/join-requests`, { farmLocationLat, farmLocationLng, farmLocation })
}

export function listPendingJoinRequests() {
  return api.get('/collaboration/join-requests/pending')
}

export function approveJoinRequest(joinRequestId) {
  return api.post(`/collaboration/join-requests/${joinRequestId}/approve`)
}

export function rejectJoinRequest(joinRequestId) {
  return api.post(`/collaboration/join-requests/${joinRequestId}/reject`)
}

export function bookTaskDate(taskRequestId, bookingDate) {
  return api.post(`/collaboration/task-requests/${taskRequestId}/bookings`, { bookingDate })
}

export function deleteTaskRequest(taskRequestId) {
  return api.del(`/collaboration/task-requests/${taskRequestId}`)
}

export function myUpcomingWork() {
  return api.get('/collaboration/me/upcoming-work')
}

export function myGroupSchedule() {
  return api.get('/collaboration/me/group-schedule')
}

export function confirmBooking(bookingId) {
  return api.post(`/collaboration/bookings/${bookingId}/confirm`)
}

export function disputeBooking(bookingId, reason) {
  return api.post(`/collaboration/bookings/${bookingId}/dispute`, { reason })
}

export function rescheduleBooking(bookingId, bookingDate) {
  return api.post(`/collaboration/bookings/${bookingId}/reschedule`, { bookingDate })
}
