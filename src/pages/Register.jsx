import { useState } from 'react'
import './Register.css'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from '../i18n'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = t('validation.nameRequired')
    if (!form.email.trim()) e.email = t('validation.emailRequired')
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = t('validation.invalidEmail')
    if (!form.password) e.password = t('validation.passwordRequired')
    else if (form.password.length < 6) e.password = t('validation.passwordLength')
    if (form.password !== form.confirm) e.confirm = t('validation.passwordMatch')
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const eobj = validate()
    setErrors(eobj)
    if (Object.keys(eobj).length === 0) {
      setSubmitting(true)
      try {
        const user = await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
        // ensure user is set in context before navigating
        if (user) navigate('/home', { state: { registered: true } })
      } catch (err) {
        setSubmitError(err.message || t('errors.registrationFailed'))
      } finally {
        setSubmitting(false)
      }
    }
  }

  const { t, lang } = useTranslation()

  return (
    <div className="register-page">
      <h2>{t('auth.registerTitle') || 'Create Account'}</h2>
      {submitError && <div className="error">{submitError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <label>
          {t('auth.name') || 'Name'}
          <input name="name" value={form.name} onChange={handleChange} disabled={submitting} />
          {errors.name && <div className="error">{errors.name}</div>}
        </label>

        <label>
          {t('auth.email') || 'Email'}
          <input name="email" value={form.email} onChange={handleChange} disabled={submitting} />
          {errors.email && <div className="error">{errors.email}</div>}
        </label>

        <label>
          {t('auth.password') || 'Password'}
          <input name="password" type="password" value={form.password} onChange={handleChange} disabled={submitting} />
          {errors.password && <div className="error">{errors.password}</div>}
        </label>

        <label>
          {t('auth.confirm') || 'Confirm Password'}
          <input name="confirm" type="password" value={form.confirm} onChange={handleChange} disabled={submitting} />
          {errors.confirm && <div className="error">{errors.confirm}</div>}
        </label>

        <button type="submit" disabled={submitting}>{submitting ? (t('auth.registering') || 'Registering...') : (t('auth.registerBtn') || 'Register')}</button>
      </form>

      <p style={{ marginTop: 12 }}>{t('auth.already') || 'Already have an account?'} <Link to="/login">{t('auth.loginBtn') || 'Log in'}</Link></p>
    </div>
  )
}
