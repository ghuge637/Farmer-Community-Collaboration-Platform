
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import './BottomNavBar.css';
import { MdHome, MdAddCircle, MdPerson, MdSupportAgent, MdBuild, MdRecommend, MdAgriculture, MdHandshake } from 'react-icons/md';
import { useState, useRef, useEffect } from 'react';

export default function BottomNavBar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const [showServices, setShowServices] = useState(false);
  const servicesBtnRef = useRef(null);
  const modalRef = useRef(null);

  // Service items with icons and i18n keys
  const serviceItems = [
    { to: '/crop-recommendation', icon: <MdRecommend size={22} />, label: t('nav.cropRecommendation') },
    { to: '/experts', icon: <MdSupportAgent size={22} />, label: t('nav.expertAdvisory') },
    { to: '/collaboration', icon: <MdHandshake size={22} />, label: t('nav.collaboration') || (lang === 'mr' ? 'सहयोगी कार्य' : 'Collaboration') },
    { to: '/labor', icon: <MdAgriculture size={22} />, label: t('nav.laborResource') || (lang === 'mr' ? 'कामगार' : 'Labour') },
  ];

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        showServices &&
        servicesBtnRef.current &&
        !servicesBtnRef.current.contains(e.target) &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        setShowServices(false);
      }
    }
    if (showServices) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showServices]);

  // Determine which icon should be active
  function getActiveIcon() {
    if (showServices) return 'services';
    if (location.pathname === '/home') return 'home';
    if (location.pathname === '/create') return 'create';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return '';
  }
  const active = getActiveIcon();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 700);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user || !isMobile) return null;

  return (
    <>
      {/* Mobile nav bar */}
      <nav className="bottom-nav-bar">
        <Link to="/home" className={active === 'home' ? 'active' : ''} aria-label={t('nav.farmerHome')}>
          <span className="nav-icon" aria-label={t('nav.farmerHome')}><MdHome size={28} /></span>
          <span className="nav-label">{t('nav.farmerHome')}</span>
        </Link>
        <button
          ref={servicesBtnRef}
          className={active === 'services' ? 'active' : ''}
          aria-label={t('nav.services')}
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
          onClick={() => setShowServices((v) => !v)}
        >
          <span className="nav-icon" aria-label={t('nav.services')}><MdBuild size={28} /></span>
          <span className="nav-label">{t('nav.services')}</span>
        </button>
        <button
          className={active === 'create' ? 'active' : ''}
          aria-label={t('nav.addUpdate')}
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
          onClick={() => navigate('/create', { state: { backgroundLocation: location } })}
        >
          <span className="nav-icon" aria-label={t('nav.addUpdate')}><MdAddCircle size={28} /></span>
          <span className="nav-label">{t('nav.addUpdate')}</span>
        </button>
        <Link to="/profile" className={active === 'profile' ? 'active' : ''} aria-label={t('nav.myProfile')}>
          <span className="nav-icon" aria-label={t('nav.myProfile')}><MdPerson size={28} /></span>
          <span className="nav-label">{t('nav.myProfile')}</span>
        </Link>
      </nav>
      {/* Services Popup */}
      {showServices && (
        <div className="services-popup-overlay">
          <div className="services-popup-modal" ref={modalRef}>
            <button className="services-popup-close" onClick={() => setShowServices(false)} aria-label={t('common.close') || "Close"}>&times;</button>
            <div style={{ fontWeight: 700, marginBottom: 8, textAlign: 'center', fontSize: '1.1em' }}>{t('nav.services')}</div>
            {serviceItems.map((item) => (
              <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: 'var(--agri-green)', textDecoration: 'none', fontSize: '1.08rem', borderRadius: 8, transition: 'background 0.15s' }} onClick={() => setShowServices(false)}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
