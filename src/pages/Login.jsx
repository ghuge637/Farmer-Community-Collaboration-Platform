import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import './Register.css'
import { useTranslation } from '../i18n'

export default function Login() {
  const [authMode, setAuthMode] = useState('otp') // 'otp' or 'email'
  const [step, setStep] = useState('phone') // 'phone' or 'verify'

  // Phone OTP State
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [devOtp, setDevOtp] = useState('')
  const [timer, setTimer] = useState(0)

  // Email State
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { login, sendOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const otpInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  // Resend Timer Countdown
  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  // Phone input sanitizer & edge-case handler
  function handlePhoneChange(e) {
    setError('')
    let val = e.target.value.replace(/\D/g, '') // Strip non-numeric characters

    // Edge Case: Leading '0' (e.g., 09876543210 -> 9876543210)
    if (val.length === 11 && val.startsWith('0')) {
      val = val.substring(1)
    }
    // Edge Case: User includes '91' country prefix (e.g. 919876543210 -> 9876543210)
    else if (val.length === 12 && val.startsWith('91')) {
      val = val.substring(2)
    }

    if (val.length > 10) {
      val = val.slice(0, 10)
    }

    setPhone(val)
  }

  // Client-side phone validation
  function validatePhoneNumber(num) {
    if (!num || num.length !== 10) {
      return 'Please enter a valid 10-digit mobile number.'
    }

    // Edge Case: Dummy repeated digits (e.g. 0000000000, 9999999999)
    if (/^(\d)\1{9}$/.test(num)) {
      return 'Invalid mobile number. Repeated digits like 0000000000 are not allowed.'
    }

    // Edge Case: Indian mobile numbers must start with 6, 7, 8, or 9
    const firstDigit = num.charAt(0)
    if (firstDigit < '6' || firstDigit > '9') {
      return 'Indian mobile numbers must start with 6, 7, 8, or 9.'
    }

    return null
  }

  // Handle OTP digit box changes
  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-advance to next box
    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus()
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus()
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '')
    if (pastedData.length === 6) {
      const digits = pastedData.split('')
      setOtp(digits)
      otpInputRefs[5].current?.focus()
    }
  }

  // Submit Step 1: Send OTP
  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    const valErr = validatePhoneNumber(phone)
    if (valErr) {
      return setError(valErr)
    }

    setLoading(true)
    try {
      const res = await sendOtp(phone)
      if (res) {
        setIsNewUser(!!res.isNewUser)
        setDevOtp(res.devOtp || '')
      }
      setStep('verify')
      setTimer(30)
      setSuccessMsg(`OTP sent to +91 ${phone}`)
    } catch (err) {
      setError(err?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Submit Step 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    
    if (isNewUser && !name.trim()) {
      return setError('Please enter your name to complete account registration.')
    }

    const code = otp.join('')
    if (code.length < 6) {
      return setError('Please enter complete 6-digit OTP')
    }

    setLoading(true)
    try {
      await verifyOtp(phone, code, name.trim())
      navigate('/home')
    } catch (err) {
      setError(err?.message || 'Invalid OTP code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Email Login
  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    if (!emailForm.email || !emailForm.password) return setError(t('errors.credentialsRequired') || 'Email and password required')
    setLoading(true)
    try {
      await login(emailForm.email.trim(), emailForm.password)
      navigate('/home')
    } catch (err) {
      if (err && err.status === 401) setError(t('common.invalidCreds') || 'Invalid email or password')
      else setError(err && err.message ? err.message : t('errors.loginFailed') || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <h2>🌾 {t('auth.loginTitle') || 'Welcome to Maze Shet'}</h2>

      {/* Mode Switcher Tabs */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${authMode === 'otp' ? 'active' : ''}`}
          onClick={() => {
            setAuthMode('otp')
            setError('')
          }}
        >
          📱 Mobile OTP
        </button>
        <button
          type="button"
          className={`auth-tab ${authMode === 'email' ? 'active' : ''}`}
          onClick={() => {
            setAuthMode('email')
            setError('')
          }}
        >
          ✉️ Email & Password
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {successMsg && step === 'verify' && <div className="success">{successMsg}</div>}

      {/* MODE 1: MOBILE OTP LOGIN */}
      {authMode === 'otp' && (
        <>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} noValidate>
              <label>
                Mobile Number
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">🇮🇳 +91</span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </label>

              <button type="submit" disabled={loading || phone.length < 10}>
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} noValidate>
              {/* Dev Mode Banner displaying code ONLY in local dev mode */}
              {devOtp ? (
                <div className="dev-otp-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span>💡 Dev Test OTP Code:</span>
                    <strong style={{ marginLeft: 6 }}>{devOtp}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = devOtp.split('').slice(0, 6)
                      setOtp(digits)
                    }}
                    style={{
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Auto-Fill Code
                  </button>
                </div>
              ) : (
                <div className="sms-info-banner">
                  📲 OTP sent via SMS to <strong>+91 {phone}</strong>. Please check your mobile phone messages.
                </div>
              )}

              {/* NEW USER NAME PROMPT BOX */}
              {isNewUser && (
                <div className="new-user-welcome-box">
                  <h4>🎉 Welcome New Farmer!</h4>
                  <p>This phone number is new. Please enter your name to complete your registration:</p>
                  <input
                    type="text"
                    placeholder="Enter your full name (e.g. Ramesh Kumar)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.95rem', color: '#475569' }}>
                  OTP sent to <strong>+91 {phone}</strong>
                </span>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={() => {
                    setStep('phone')
                    setOtp(['', '', '', '', '', ''])
                    setError('')
                  }}
                >
                  Edit Number
                </button>
              </div>

              <label>Enter 6-Digit Verification Code</label>
              <div className="otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    className="otp-input"
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={loading}
                    autoFocus={!isNewUser && idx === 0}
                  />
                ))}
              </div>

              <div className="otp-timer-container">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  className="resend-btn"
                  disabled={timer > 0 || loading}
                  onClick={handleSendOtp}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </button>
              </div>

              <button type="submit" disabled={loading || otp.join('').length < 6}>
                {loading ? 'Verifying...' : (isNewUser ? 'Complete Registration & Log In' : 'Verify & Log In')}
              </button>
            </form>
          )}
        </>
      )}

      {/* MODE 2: EMAIL LOGIN FALLBACK */}
      {authMode === 'email' && (
        <form onSubmit={handleEmailSubmit} noValidate>
          <label>
            {t('auth.email') || 'Email'}
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
              disabled={loading}
            />
          </label>

          <label style={{ marginTop: 12 }}>
            {t('auth.password') || 'Password'}
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
              disabled={loading}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : t('auth.loginBtn') || 'Log in'}
          </button>
        </form>
      )}

      <p style={{ marginTop: 20 }}>
        {t('auth.dontHave') || "Don't have an account?"}{' '}
        <Link to="/register">{t('auth.registerBtn') || 'Register'}</Link>
      </p>

      {/* Mobile Server IP Quick Switcher Bar */}
      <div style={{ marginTop: 25, paddingTop: 15, borderTop: '1px dashed #cbd5e1', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
          🌐 Active Backend: <span style={{ color: '#2563eb' }}>{localStorage.getItem('CUSTOM_SERVER_URL') || 'http://10.0.2.2:8080'}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('CUSTOM_SERVER_URL', 'http://10.0.2.2:8080')
              window.location.reload()
            }}
            style={{
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            🤖 Emulator (10.0.2.2)
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.setItem('CUSTOM_SERVER_URL', 'http://172.24.50.1:8080')
              window.location.reload()
            }}
            style={{
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            📱 Phone (172.24.50.1)
          </button>

          <button
            type="button"
            onClick={() => {
              const current = localStorage.getItem('CUSTOM_SERVER_URL') || 'http://10.0.2.2:8080'
              const input = prompt('Enter custom Backend URL:', current)
              if (input !== null && input.trim()) {
                localStorage.setItem('CUSTOM_SERVER_URL', input.trim().replace(/\/api\/?$/, ''))
                window.location.reload()
              }
            }}
            style={{
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            ✏️ Custom IP
          </button>
        </div>
      </div>
    </div>
  )
}
