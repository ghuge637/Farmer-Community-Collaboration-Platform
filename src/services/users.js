// import api from './api'
import { api } from '../services/api'


export async function getUser(userId) {
  return api.get(`/users/${userId}`)
}

export async function updateUser(userId, updates) {
  return api.put(`/users/${userId}`, updates)
}

export async function getAllUsers() { return api.get('/users') }

export default { getUser, updateUser, getAllUsers }
