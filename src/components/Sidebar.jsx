import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { MdHome, MdSupportAgent, MdRecommend, MdPerson, MdSettings, MdLogout, MdGroups, MdAgriculture, MdHandshake, MdAccountBalance } from 'react-icons/md';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang } = useTranslation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Permission-based rendering
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <nav className="home-nav-sidebar">
        <ul className="nav-menu-list">
          <li>
            <NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdHome size={22} />
              <span>{t('nav.farmerHome') || 'Home'}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/experts" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdSupportAgent size={22} />
              <span>{t('nav.expertAdvice') || 'Expert Advice'}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/expert-list" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdGroups size={22} />
              <span>{t('nav.experts') || 'Experts'}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/collaboration" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdHandshake size={22} />
              <span>{t('nav.collaboration') || (lang === 'mr' ? 'सहयोगी कार्य' : 'Collaboration')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/labor" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdAgriculture size={22} />
              <span>{t('nav.laborResource') || (lang === 'mr' ? 'कामगार' : 'Labour')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/crop-recommendation" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdRecommend size={22} />
              <span>{t('nav.cropRecommendation') || 'Crop Recommendation'}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/schemes" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdAccountBalance size={22} />
              <span>{t('nav.schemes') || (lang === 'mr' ? 'सरकारी योजना' : 'Govt Schemes')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to={`/profile/${user?.id || ''}`} className={({ isActive }) => isActive ? 'active' : ''}>
              <MdPerson size={22} />
              <span>{t('nav.myProfile') || 'My Profile'}</span>
            </NavLink>
          </li>
          {/* Admin-only button */}
          {isAdmin && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                <MdSettings size={22} />
                <span>{t('nav.adminDashboard') || 'Admin Dashboard'}</span>
              </NavLink>
            </li>
          )}
          {/* Settings for all users */}
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              <MdSettings size={22} />
              <span>{t('nav.settings') || 'Settings'}</span>
            </NavLink>
          </li>
          <li className="nav-divider"></li>
          <li>
            <button onClick={() => setShowLogoutConfirm(true)} className="nav-logout-btn">
              <MdLogout size={22} />
              <span>{t('nav.logout') || 'Logout'}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="logout-popup-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            zIndex: 2147483647,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowLogoutConfirm(false)}
          role="presentation"
        >
          <div
            className="logout-popup-content"
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '320px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              zIndex: 2147483647
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 style={{ marginTop: 0, color: '#333', marginBottom: '12px' }}>{t('nav.logout') || 'Log Out'}?</h3>
            <p style={{ color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>{t('common.logoutConfirm') || 'Are you sure you want to log out?'}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                  flex: 1
                }}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  logout()
                  setShowLogoutConfirm(false)
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#d32f2f',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  flex: 1
                }}
              >
                {t('nav.logout') || 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
