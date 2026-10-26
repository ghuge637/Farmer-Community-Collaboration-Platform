import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as usersService from '../services/users'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../i18n'

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    async function check() {
      if (loading) return
      if (user) return navigate('/home')
      const users = await usersService.getAllUsers()
      if (users && users.length > 0) navigate('/login')
      else navigate('/register')
    }
    check()
  }, [user, loading, navigate])

  return <div style={{ padding: 24 }}>{t('home.loading')}</div>
}
