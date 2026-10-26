import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../services/auth'
import { setToken } from '../services/api'
import { useTranslation } from '../i18n'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function init() {
      try {
        const me = await authApi.me()
        setUser(me)
      } catch {
        setUser(null)
      }
      setLoading(false)
    }
    init()
  }, [])

  async function login(email, password) {
    const res = await authApi.login({ email, password })
    if (res && res.token) {
      setToken(res.token)
      setUser({
        id: res.userId,
        name: res.name,
        email: res.email,
        phoneNumber: res.phoneNumber,
        bio: res.bio,
        avatarColor: res.avatarColor,
        region: res.region,
        role: res.role,
        laborCreditBalance: res.laborCreditBalance,
        dailyCommitmentLimit: res.dailyCommitmentLimit,
      })
      return res
    }
    const me = await authApi.me()
    setUser(me)
    return me
  }

  async function sendOtp(phoneNumber) {
    return await authApi.sendOtp({ phoneNumber })
  }

  async function verifyOtp(phoneNumber, otp, name) {
    const res = await authApi.verifyOtp({ phoneNumber, otp, name })
    if (res && res.token) {
      setToken(res.token)
      setUser({
        id: res.userId,
        name: res.name,
        email: res.email,
        phoneNumber: res.phoneNumber,
        bio: res.bio,
        avatarColor: res.avatarColor,
        region: res.region,
        role: res.role,
        laborCreditBalance: res.laborCreditBalance,
        dailyCommitmentLimit: res.dailyCommitmentLimit,
      })
      return res
    }
    const me = await authApi.me()
    setUser(me)
    return me
  }

  async function register({ name, email, password }) {
    const res = await authApi.register({ name, email, password })
    if (res && res.token) {
      setToken(res.token)
      setUser({
        id: res.userId,
        name: res.name,
        email: res.email,
        phoneNumber: res.phoneNumber,
        bio: res.bio,
        avatarColor: res.avatarColor,
        region: res.region,
        role: res.role,
        laborCreditBalance: res.laborCreditBalance,
        dailyCommitmentLimit: res.dailyCommitmentLimit,
      })
      return res
    }
    const me = await authApi.me()
    setUser(me)
    return me
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, sendOtp, verifyOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  if (loading) return <div>{t('home.loading')}</div>
  if (!user) return null
  return children
}

export function RequireAdminAuth({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) navigate('/login')
  }, [user, loading, navigate])

  if (loading) return <div>{t('home.loading')}</div>
  if (!user || user.role !== 'ADMIN') return null
  return children
}
