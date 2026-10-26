import { api } from './api'

export async function followUser(userId) {
  return api.post(`/users/${userId}/follow`)
}

export async function unfollowUser(userId) {
  return api.post(`/users/${userId}/unfollow`)
}

export async function getFollowers(userId) {
  return api.get(`/users/${userId}/followers`)
}

export async function getFollowing(userId) {
  return api.get(`/users/${userId}/following`)
}

export default { followUser, unfollowUser, getFollowers, getFollowing }