import { Routes, Route, Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth, RequireAuth, RequireAdminAuth } from './context/AuthContext'
import { I18nProvider, useTranslation } from './i18n'
import LanguageSwitcher from './components/LanguageSwitcher'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import BottomNavBar from './components/BottomNavBar'
import Create from './pages/Create'
import PostDetail from './pages/PostDetail'
import Expert from './pages/Expert'
import ExpertList from './pages/ExpertList'
import ExpertApply from './pages/ExpertApply'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import Settings from './pages/Settings.jsx'
import Labor from './pages/Labor'
import Collaboration from './pages/Collaboration'
import CropRecommendation from './pages/CropRecommendation'
import Schemes from './pages/Schemes'

import { MdMenu, MdHome, MdPerson, MdSupportAgent, MdLogout, MdSettings, MdRecommend, MdGroups, MdSearch, MdAgriculture, MdHandshake, MdAccountBalance } from 'react-icons/md';
import { useState, useEffect, useRef } from 'react';
import * as usersApi from './services/users';
import SecureImage from './components/SecureImage';

function Nav() {
  const { user, logout } = useAuth();
  const { t, lang } = useTranslation(); // Use lang to trigger re-render on language change
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const searchToggleRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setShowMobileSearch(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search bar after submission
      setShowMobileSearch(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showMobileSearch &&
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchToggleRef.current &&
        !searchToggleRef.current.contains(event.target)
      ) {
        setShowMobileSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileSearch]);

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarClose = () => setSidebarOpen(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // Listen for resize to update isMobile
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <nav className="site-nav">
        <div className="nav-left">
          {isMobile && user && (
            <button className="nav-menu-btn" aria-label={t('nav.menu') || "Menu"} onClick={handleSidebarToggle} style={{ background: 'none', border: 'none', padding: '0 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
              <MdMenu size={28} />
            </button>
          )}
          <Link to="/" className="brand">{t('nav.brand') || 'Maze Shet'}</Link>
        </div>
        <div className={`nav-search${showMobileSearch ? ' mobile-open' : ''}`} ref={searchRef}>
          {user && (
            <form onSubmit={handleSearchSubmit} role="search">
              <input
                id="user-search"
                type="search"
                placeholder={t('nav.searchPlaceholder') || "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label={t('nav.search') || 'Search'}>
                <MdSearch size={22} />
              </button>
            </form>
          )}
        </div>
        <div className="nav-right">
          {user && (
            <button className="nav-menu-btn mobile-search-toggle" ref={searchToggleRef} onClick={() => setShowMobileSearch(!showMobileSearch)} aria-label={t('nav.search') || 'Search'}>
              <MdSearch size={24} />
            </button>
          )}
          {user ? (
            <>
              <NavLink to="/home" className={({ isActive }) => `nav-icon-link${isActive ? ' active' : ''}`} aria-label={t('nav.farmerHome') || 'Home'}>
                <span className="nav-icon"><MdHome size={24} /></span>
                {/* <span className="nav-label">{t('nav.farmerHome') || 'Home'}</span> */}
              </NavLink>
              <NavLink to="/profile" end className={({ isActive }) => `nav-icon-link${isActive ? ' active' : ''}`} aria-label={t('nav.myProfile') || 'My Profile'}>
                <span className="nav-icon"><MdPerson size={24} /></span>
                {/* <span className="nav-label">{t('nav.myProfile') || 'My Profile'}</span> */}
              </NavLink>
              <LanguageSwitcher />
            </>
          ) : (
            <>
              <Link to="/login">{t('nav.login') || 'Login'}</Link>
              <Link to="/register">{t('nav.register') || 'Register'}</Link>
              <LanguageSwitcher />
            </>
          )}
        </div>
      </nav>
      {/* Sidebar overlay */}
      {user && (
        <>
          <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={handleSidebarClose} tabIndex={-1} aria-hidden={!sidebarOpen} />
          {/* Sidebar drawer */}
          <aside className={`sidebar-drawer${sidebarOpen ? ' open' : ''}`} aria-label={t('nav.sidebar') || "Sidebar Navigation"}>
            <button className="sidebar-close-btn" onClick={handleSidebarClose} aria-label={t('nav.closeSidebar') || "Close Sidebar"}>×</button>
            <nav className="sidebar-nav">
              <ul>
                <li><NavLink to="/home" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdHome size={22} /> {t('nav.farmerHome') || 'Home'}</NavLink></li>
                <li><NavLink to="/profile" end onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdPerson size={22} /> {t('nav.myProfile') || 'My Profile'}</NavLink></li>
                <li><NavLink to="/experts" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdSupportAgent size={22} /> {t('nav.expertAdvice') || 'Expert Advice'}</NavLink></li>
                <li><NavLink to="/expert-list" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdGroups size={22} /> {t('nav.experts') || 'Experts'}</NavLink></li>
                <li><NavLink to="/collaboration" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdHandshake size={22} /> {t('nav.collaboration') || (lang === 'mr' ? 'सहयोगी कार्य' : 'Collaboration')}</NavLink></li>
                <li><NavLink to="/labor" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdAgriculture size={22} /> {t('nav.laborResource') || (lang === 'mr' ? 'कामगार' : 'Labour')}</NavLink></li>
                <li><NavLink to="/crop-recommendation" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdRecommend size={22} /> {t('nav.cropRecommendation') || 'Crop Recommendation'}</NavLink></li>
                <li><NavLink to="/schemes" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdAccountBalance size={22} /> {t('nav.schemes') || (lang === 'mr' ? 'सरकारी योजना' : 'Govt Schemes')}</NavLink></li>
                <li><NavLink to="/settings" onClick={handleSidebarClose} className={({ isActive }) => isActive ? 'active' : ''}><MdSettings size={22} /> {t('nav.settings') || 'Settings'}</NavLink></li>
                <li><button className="sidebar-logout-btn" onClick={() => setShowLogoutConfirm(true)}><MdLogout size={22} /> {t('nav.logout') || 'Log Out'}</button></li>
              </ul>
            </nav>
          </aside>
        </>
      )}

      {showLogoutConfirm && (
        <div className="logout-popup-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 2147483647,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-popup-content" style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '12px',
            maxWidth: '320px', width: '90%', textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 2147483647
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: '#333', marginBottom: '12px' }}>{t('nav.logout') || 'Log Out'}?</h3>
            <p style={{ color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>{t('common.logoutConfirm') || 'Are you sure you want to log out?'}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{
                padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd',
                background: 'white', color: '#333', cursor: 'pointer', fontWeight: 600, flex: 1
              }}>{t('common.cancel') || 'Cancel'}</button>
              <button onClick={() => { logout(); setShowLogoutConfirm(false); }} style={{
                padding: '10px 20px', borderRadius: '8px', border: 'none',
                background: '#d32f2f', color: 'white', cursor: 'pointer', fontWeight: 600, flex: 1
              }}>{t('nav.logout') || 'Log Out'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const { t } = useTranslation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        
        const fetchUsers = async () => {
            setLoading(true);
            try {
                let allUsers = [];
                if (usersApi.getAllUsers) {
                    allUsers = await usersApi.getAllUsers();
                } else if (usersApi.default && usersApi.default.getAllUsers) {
                    allUsers = await usersApi.default.getAllUsers();
                }

                if (Array.isArray(allUsers)) {
                    const filtered = allUsers.filter(u => 
                        u.name && u.name.toLowerCase().includes(query.toLowerCase())
                    );
                    setResults(filtered);
                }
            } catch (e) {
                console.error("Search error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [query]);

    return (
        <div className="home" style={{ alignItems: 'stretch', minHeight: '60vh' }}>
            <div style={{ maxWidth: 600, width: '100%', margin: '0 auto', padding: 24 }}>
                <h2 style={{ color: '#2E7D32', marginBottom: 24 }}>
                    {t('nav.search') || 'Search'}: "{query}"
                </h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>{t('common.loading') || 'Loading...'}</div>
                ) : results.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#666', background: '#fff', borderRadius: 12 }}>
                        No users found matching "{query}"
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {results.map(user => (
                            <Link 
                                key={user.id} 
                                to={`/profile/${user.id}`}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 16, 
                                    padding: 16, 
                                    background: '#fff', 
                                    borderRadius: 12, 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ 
                                    width: 50, 
                                    height: 50, 
                                    borderRadius: '50%', 
                                    background: '#e8f5e9', 
                                    color: '#2E7D32',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {user.avatarUrl ? (
                                        <SecureImage src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        user.name ? user.name[0].toUpperCase() : '?'
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a1a1a' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{user.role || 'Farmer'}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function App() {
  const location = useLocation();
  // Modal routing: support background location
  const state = location.state;
  const backgroundLocation = state && state.backgroundLocation;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <I18nProvider>
      <AuthProvider>
        <Nav />
        <div className="container" style={{ paddingBottom: isMobile ? '80px' : '0' }}>
          <Routes location={backgroundLocation || location}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/profile/:id" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/create" element={<RequireAuth><Create /></RequireAuth>} />
            <Route path="/post/:id" element={<RequireAuth><PostDetail /></RequireAuth>} />
            <Route path="/expert" element={<RequireAuth><Expert /></RequireAuth>} />
            <Route path="/experts" element={<RequireAuth><Home onlyExperts={true} /></RequireAuth>} />
            <Route path="/expert-list" element={<RequireAuth><ExpertList /></RequireAuth>} />
            <Route path="/expert-apply" element={<RequireAuth><ExpertApply /></RequireAuth>} />
            <Route path="/labor" element={<RequireAuth><Labor /></RequireAuth>} />
            <Route path="/collaboration" element={<RequireAuth><Collaboration /></RequireAuth>} />
            <Route path="/crop-recommendation" element={<RequireAuth><CropRecommendation /></RequireAuth>} />
            <Route path="/schemes" element={<RequireAuth><Schemes /></RequireAuth>} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />
            <Route path="/search" element={<RequireAuth><SearchPage /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          </Routes>
          {/* Show modal on top if backgroundLocation exists */}
          {backgroundLocation && (
            <Routes>
              <Route path="/create" element={<RequireAuth><Create /></RequireAuth>} />
            </Routes>
          )}
        </div>
        <BottomNavBar />
      </AuthProvider>
    </I18nProvider>
  );
}
