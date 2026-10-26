import { useTranslation } from '../i18n'
import { SiGoogletranslate } from 'react-icons/si';
import { useState, useRef } from 'react';

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useTranslation();
  const [showNames, setShowNames] = useState(false);

  const handleIconClick = () => setShowNames((v) => !v);
  const handleBlur = (e) => {
    // Only close if focus leaves both icon and dropdown
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowNames(false);
    }
  };

  return (
    <div className="lang-switcher" role="navigation" aria-label="Language selector" style={{ position: 'relative', display: 'inline-block' }} onBlur={handleBlur} tabIndex={-1}>
      <button
        className="lang-icon-btn"
        title="Show language selector"
        onClick={handleIconClick}
        aria-haspopup="listbox"
        aria-expanded={showNames}
        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
      >
        <span className="lang-icon"><SiGoogletranslate size={22} style={{ verticalAlign: 'middle', marginRight: 4, color: '#fff' }} /></span>
      </button>
      {showNames && (
        <select
          className="lang-select lang-select-popup"
          value={lang}
          onChange={e => { setLanguage(e.target.value); setShowNames(false); }}
          aria-label="Select language"
          size={2}
          style={{ position: 'absolute', right: 0, top: '120%', zIndex: 20, minWidth: 100, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '8px 0', outline: 'none' }}
          tabIndex={0}
          onBlur={() => setShowNames(false)}
        >
          <option value="en">English</option>
          <option value="mr">मराठी</option>
        </select>
      )}
    </div>
  );
}
