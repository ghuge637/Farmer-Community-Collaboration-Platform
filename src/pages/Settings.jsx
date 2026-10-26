import { useTranslation } from '../i18n';

export default function Settings() {
  const { t, lang, setLanguage } = useTranslation();

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#2E7D32' }}>{t('nav.settings')}</h2>
      
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>{t('settings.language') || 'Language'}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.8rem', borderRadius: '8px', background: lang === 'en' ? '#e8f5e9' : 'transparent', border: lang === 'en' ? '1px solid #2E7D32' : '1px solid transparent', transition: 'all 0.2s' }}>
            <input 
              type="radio" 
              name="language" 
              checked={lang === 'en'} 
              onChange={() => setLanguage('en')}
              style={{ marginRight: '12px', accentColor: '#2E7D32', width: '1.2rem', height: '1.2rem' }}
            />
            <span style={{ fontWeight: lang === 'en' ? '600' : '400', fontSize: '1rem' }}>English</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.8rem', borderRadius: '8px', background: lang === 'mr' ? '#e8f5e9' : 'transparent', border: lang === 'mr' ? '1px solid #2E7D32' : '1px solid transparent', transition: 'all 0.2s' }}>
            <input 
              type="radio" 
              name="language" 
              checked={lang === 'mr'} 
              onChange={() => setLanguage('mr')}
              style={{ marginRight: '12px', accentColor: '#2E7D32', width: '1.2rem', height: '1.2rem' }}
            />
            <span style={{ fontWeight: lang === 'mr' ? '600' : '400', fontSize: '1rem' }}>मराठी (Marathi)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
