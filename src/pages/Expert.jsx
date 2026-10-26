import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import expertApi from '../services/expert';
import { useTranslation } from '../i18n';

export default function Expert() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ specialization: '', cropExpertise: '', yearsOfExperience: '', region: '', bio: '' });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, lang } = useTranslation();

  if (loading) return <div>{t('common.loading') || 'Loading...'}</div>;

  if (!user) return <div style={{ padding: 32, textAlign: 'center' }}>{t('expert.loginRequired') || 'Please log in to access expert features.'}</div>;

  if (user.role !== 'FARMER') {
    return <div style={{ padding: 32, textAlign: 'center' }}>{t('expert.alreadyApplied') || 'You have already applied or are an expert/admin.'}</div>;
  }

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      // Always send a non-null integer for yearsOfExperience (default to 0 if empty or invalid)
      const yearsOfExperience = Number(form.yearsOfExperience);
      await expertApi.applyForExpert({
        ...form,
        yearsOfExperience: isNaN(yearsOfExperience) ? 0 : yearsOfExperience
      });
      setStatus(t('expert.applicationSubmitted') || 'Application submitted and pending review.');
    } catch (err) {
      console.error('Expert application error:', err);
      setError(err.message || (t('expert.applicationFailed') || 'Failed to submit application.'));
    }
    setSubmitting(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
      <h2>{t('expert.applyTitle') || 'Apply to Become an Expert'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>{t('expert.specialization') || 'Specialization'}</label>
          <input name="specialization" value={form.specialization} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>{t('expert.cropExpertise') || 'Crop Expertise'}</label>
          <input name="cropExpertise" value={form.cropExpertise} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>{t('expert.yearsOfExperience') || 'Years of Experience'}</label>
          <input name="yearsOfExperience" type="number" min="0" value={form.yearsOfExperience} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>{t('expert.region') || 'Region'}</label>
          <input name="region" value={form.region} onChange={handleChange} required style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>{t('expert.bio') || 'Bio'}</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} style={{ width: '100%', padding: 8 }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {status && <div style={{ color: 'green', marginBottom: 12 }}>{status}</div>}
        <button type="submit" disabled={submitting} style={{ width: '100%', padding: 10 }}>
          {submitting ? (t('common.submitting') || 'Submitting...') : (t('expert.applyBtn') || 'Apply')}
        </button>
      </form>
    </div>
  );
}
