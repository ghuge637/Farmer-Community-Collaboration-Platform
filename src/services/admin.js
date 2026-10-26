// Example admin API service for dashboard
// You must implement these endpoints in your backend
import api from './api';

const adminApi = {
  async getDashboard() {
    // Should return: { totalUsers, totalExperts, pendingRequests, activePosts, pendingExpertApplications: [{id, name, specialization, experience}], reportedPosts: [{id, user, post, reason}] }
    return api.get('/admin/dashboard');
  },
  async approveExpert(id) {
    return api.post(`/admin/expert/${id}/approve`);
  },
  async rejectExpert(id) {
    return api.post(`/admin/expert/${id}/reject`);
  },
  async removePost(id) {
    return api.post(`/admin/reported-post/${id}/remove`);
  },
};

export default adminApi;
