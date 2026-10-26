import api from './api'

export function register({ name, email, password }) {
  return api.post('/auth/register', { name, email, password })
}

export function login({ email, password }) {
  return api.post('/auth/login', { email, password })
}

export function sendOtp({ phoneNumber }) {
  return api.post('/auth/send-otp', { phoneNumber })
}

export function verifyOtp({ phoneNumber, otp, name }) {
  return api.post('/auth/verify-otp', { phoneNumber, otp, name })
}

export function me() {
  return api.get('/auth/me')
}

export function logout() {
  return api.post('/auth/logout')
}

export default { register, login, sendOtp, verifyOtp, me, logout }
