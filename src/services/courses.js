import { api } from './api';

export async function createCourse(data) {
  return api.post('/expert/services', data);
}

export async function getCoursesByExpert(expertId) {
  return api.get(`/expert/services/${expertId}`);
}

export async function updateCourse(courseId, updates) {
  return api.put(`/expert/services/${courseId}`, updates);
}

export async function deleteCourse(courseId) {
  return api.del(`/expert/services/${courseId}`);
}

export default { createCourse, getCoursesByExpert, updateCourse, deleteCourse };
