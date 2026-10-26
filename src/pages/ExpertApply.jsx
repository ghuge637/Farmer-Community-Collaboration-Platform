import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import expertApi from '../services/expert'
import { useTranslation } from '../i18n'
import Sidebar from '../components/Sidebar'

export default function ExpertApply() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ specialization: '', cropExpertise: '', yearsOfExperience: '', region: '', bio: '' })
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const yearsOfExperience = Number(form.yearsOfExperience)
      await expertApi.applyForExpert({ ...form, yearsOfExperience: isNaN(yearsOfExperience) ? 0 : yearsOfExperience })
      alert(t('expert.applicationSubmitted') || 'Application submitted and pending review.')
      navigate(-1)
    } catch (err) {
      alert(err.message || (t('expert.applicationFailed') || 'Failed to submit application.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="home">
      <Sidebar />
      <main className="feed">
        <div style={{ padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
          <h2 style={{ marginTop: 0 }}>{t('expert.applyTitle') || 'Apply to Become an Expert'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>{t('expert.specialization') || 'Specialization'}</label>
              <input name="specialization" value={form.specialization} onChange={handleChange} required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>{t('expert.cropExpertise') || 'Crop Expertise'}</label>
              <input name="cropExpertise" value={form.cropExpertise} onChange={handleChange} required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>{t('expert.yearsOfExperience') || 'Years of Experience'}</label>
              <input name="yearsOfExperience" type="number" min="0" value={form.yearsOfExperience} onChange={handleChange} required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>{t('expert.region') || 'Region'}</label>
              <input name="region" value={form.region} onChange={handleChange} required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>{t('expert.bio') || 'Bio'}</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <button type="submit" disabled={submitting} style={{ width: '100%', padding: 10, background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              {submitting ? (t('common.submitting') || 'Submitting...') : (t('expert.applyBtn') || 'Apply')}
            </button>
          </form>
        </div>
      </main>
      <div className="home-weather-panel"></div>
    </div>
  )
}