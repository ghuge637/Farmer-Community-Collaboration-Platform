import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { getLaborResources } from '../services/labor';
import { getUser } from '../services/users';
import './Home.css';

const DEFAULT_LABORERS = [
  { id: 1, name: 'Ramesh Patil', role: 'General Farm Worker', roleMr: '\u0936\u0947\u0924\u092e\u091c\u0942\u0930', experience: 5, location: 'Pune', status: 'AVAILABLE', phone: '919876543210', avatarColor: '#4caf50' },
  { id: 2, name: 'Suresh Mane', role: 'Tractor Driver', roleMr: '\u091f\u094d\u0930\u0945\u0915\u094d\u091f\u0930 \u091a\u093e\u0932\u0915', experience: 8, location: 'Nashik', status: 'BUSY', phone: '919876543211', avatarColor: '#ff9800' },
  { id: 3, name: 'Ganesh Koli', role: 'Harvester', roleMr: '\u0915\u093e\u092a\u0923\u0940 \u0915\u093e\u092e\u0917\u093e\u0930', experience: 3, location: 'Satara', status: 'AVAILABLE', phone: '919876543212', avatarColor: '#2196f3' },
  { id: 4, name: 'Vijay Deshmukh', role: 'Pesticide Sprayer', roleMr: '\u092b\u0935\u093e\u0930\u0923\u0940 \u0915\u093e\u092e\u0917\u093e\u0930', experience: 6, location: 'Nagpur', status: 'AVAILABLE', phone: '919876543213', avatarColor: '#9c27b0' },
  { id: 5, name: 'Anita Shinde', role: 'Weeding Specialist', roleMr: '\u0916\u0941\u0930\u092a\u0923\u0940 \u0915\u093e\u092e\u0917\u093e\u0930', experience: 4, location: 'Solapur', status: 'AVAILABLE', phone: '919876543214', avatarColor: '#e91e63' },
  { id: 6, name: 'Raju Pawar', role: 'Irrigation Helper', roleMr: '\u092a\u093e\u0923\u0940 \u092a\u0941\u0930\u0935\u0920\u093e \u092e\u0926\u0924\u0928\u0940\u0938', experience: 2, location: 'Aurangabad', status: 'AVAILABLE', phone: '919876543215', avatarColor: '#00bcd4' },
  { id: 7, name: 'Vikas Pawar', role: 'Farm Manager', roleMr: '\u0936\u0947\u0924\u0940 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0915', experience: 10, location: 'Baramati', status: 'AVAILABLE', phone: '919876543220', avatarColor: '#009688' },
  { id: 8, name: 'Suman Kale', role: 'Sowing Specialist', roleMr: '\u092a\u0947\u0930\u0923\u0940 \u0924\u091c\u094d\u091e', experience: 6, location: 'Latur', status: 'AVAILABLE', phone: '919876543221', avatarColor: '#673ab7' },
  { id: 9, name: 'Arun Gaikwad', role: 'Irrigation Expert', roleMr: '\u0938\u093f\u0902\u091a\u0928 \u0924\u091c\u094d\u091e', experience: 8, location: 'Nanded', status: 'AVAILABLE', phone: '919876543222', avatarColor: '#3f51b5' },
  { id: 10, name: 'Meena Patil', role: 'General Helper', roleMr: '\u092e\u0926\u0924\u0928\u0940\u0938', experience: 2, location: 'Dhule', status: 'AVAILABLE', phone: '919876543223', avatarColor: '#e91e63' },
];

const TRANSLATIONS = {
  en: {
    title: 'Labour',
    subtitle: 'Find skilled and unskilled labor for your farm tasks.',
    nearbyTitle: 'Showing labour for your location',
    filterRegion: 'Filter by region',
    allRegions: 'All regions',
    experience: 'Exp',
    years: 'yrs',
    location: 'Location',
    available: 'AVAILABLE',
    busy: 'BUSY',
    contact: 'Contact',
    loading: 'Loading labour data...',
    empty: 'No labour data available right now.',
    noRegionMatch: 'No labour data found for this region.',
  },
  mr: {
    title: '\u0915\u093e\u092e\u0917\u093e\u0930',
    subtitle: '\u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0936\u0947\u0924\u0940\u0938\u093e\u0920\u0940 \u0915\u0941\u0936\u0932 \u0906\u0923\u093f \u0905\u0915\u0941\u0936\u0932 \u0915\u093e\u092e\u0917\u093e\u0930 \u0936\u094b\u0927\u093e.',
    nearbyTitle: '\u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0920\u093f\u0915\u093e\u0923\u093e\u091c\u0935\u0933\u0940\u0932 \u0915\u093e\u092e\u0917\u093e\u0930',
    filterRegion: '\u0935\u093f\u092d\u093e\u0917\u093e\u0928\u0941\u0938\u093e\u0930 \u092b\u093f\u0932\u094d\u091f\u0930',
    allRegions: '\u0938\u0930\u094d\u0935 \u0935\u093f\u092d\u093e\u0917',
    experience: '\u0905\u0928\u0941\u092d\u0935',
    years: '\u0935\u0930\u094d\u0937\u0947',
    location: '\u0920\u093f\u0915\u093e\u0923',
    available: '\u0909\u092a\u0932\u092c\u094d\u0927',
    busy: '\u0935\u094d\u092f\u0938\u094d\u0924',
    contact: '\u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u093e',
    loading: '\u0915\u093e\u092e\u0917\u093e\u0930 \u092e\u093e\u0939\u093f\u0924\u0940 \u0932\u094b\u0921 \u0939\u094b\u0924 \u0906\u0939\u0947...',
    empty: '\u0938\u0927\u094d\u092f\u093e \u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0915\u093e\u092e\u0917\u093e\u0930 \u092e\u093e\u0939\u093f\u0924\u0940 \u0909\u092a\u0932\u092c\u094d\u0927 \u0928\u093e\u0939\u0940.',
    noRegionMatch: '\u092f\u093e \u0935\u093f\u092d\u093e\u0917\u093e\u0938\u093e\u0920\u0940 \u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0915\u093e\u092e\u0917\u093e\u0930 \u092e\u093e\u0939\u093f\u0924\u0940 \u0938\u093e\u092a\u0921\u0932\u0940 \u0928\u093e\u0939\u0940.',
  },
};

function normalizeLocation(value) {
  return (value || '').trim().toLowerCase();
}

function locationsMatch(a, b) {
  const left = normalizeLocation(a);
  const right = normalizeLocation(b);

  if (!left || !right) return false;
  return left === right || left.startsWith(`${right},`) || right.startsWith(`${left},`);
}

export default function Labor() {
  const { user: currentUser } = useAuth();
  const { t, lang } = useTranslation();
  const [laborers, setLaborers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [userRegion, setUserRegion] = useState('');
  const txt = TRANSLATIONS[lang === 'mr' ? 'mr' : 'en'];
  const regions = [...new Set(laborers.map((worker) => worker.location).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const displayedLaborers = selectedRegion
    ? laborers.filter((worker) => worker.location === selectedRegion)
    : laborers;

  useEffect(() => {
    let ignore = false;

    async function loadLaborers() {
      setLoading(true);

      try {
        const [data, userProfile] = await Promise.all([
          getLaborResources(),
          currentUser?.id ? getUser(currentUser.id).catch(() => null) : Promise.resolve(null),
        ]);

        const nextLaborers = Array.isArray(data) && data.length > 0 ? data : DEFAULT_LABORERS;
        const nextUserRegion = (userProfile?.region || currentUser?.region || '').trim();
        const matchedRegion = nextLaborers.find((worker) => locationsMatch(worker.location, nextUserRegion))?.location || '';

        if (!ignore) {
          setLaborers(nextLaborers);
          setUserRegion(nextUserRegion);
          setSelectedRegion(matchedRegion);
        }
      } catch (err) {
        console.warn('Falling back to default labor data', err);
        if (!ignore) {
          setLaborers(DEFAULT_LABORERS);
          setUserRegion((currentUser?.region || '').trim());
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadLaborers();

    return () => {
      ignore = true;
    };
  }, [currentUser?.id, currentUser?.region]);

  useEffect(() => {
    if (selectedRegion && !regions.includes(selectedRegion)) {
      setSelectedRegion('');
    }
  }, [regions, selectedRegion]);

  return (
    <div className="home">
      <Sidebar />
      <main className="feed" style={{ maxWidth: '100%' }}>
        <div className="expert-list-container">
          <div className="expert-list-header">
            <h2 style={{ color: '#2E7D32', marginTop: 0 }}>
              {t('nav.laborResource') || txt.title}
            </h2>
            <p className="expert-subtitle">
              {txt.subtitle}
            </p>
            {!loading && selectedRegion && userRegion && locationsMatch(selectedRegion, userRegion) && (
              <p className="expert-subtitle" style={{ marginTop: 8, color: '#2E7D32', fontWeight: 600 }}>
                {txt.nearbyTitle}: {selectedRegion}
              </p>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>{txt.loading}</div>
          ) : laborers.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>{txt.empty}</div>
          ) : (
            <>
              <div className="expert-filters">
                <select
                  value={selectedRegion}
                  onChange={(event) => setSelectedRegion(event.target.value)}
                  aria-label={txt.filterRegion}
                >
                  <option value="">{txt.allRegions}</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {displayedLaborers.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>{txt.noRegionMatch}</div>
              ) : (
                <div className="expert-grid">
                  {displayedLaborers.map((worker) => (
                    <div key={worker.id} className="expert-card">
                      <div className="expert-card-header">
                        <div className="expert-avatar-wrapper" style={{ backgroundColor: worker.avatarColor }}>
                          <span className="expert-initial">{worker.name?.charAt(0) || '?'}</span>
                        </div>
                        <div className="expert-identity">
                          <h3 className="expert-name">{worker.name}</h3>
                          <span className="expert-specialization">
                            {lang === 'mr' ? (worker.roleMr || worker.role) : worker.role}
                          </span>
                        </div>
                      </div>

                      <div className="expert-card-body">
                        <div className="expert-stat-row">
                          <div className="expert-stat">
                            <span className="stat-label">{t('expert.experience') || txt.experience}</span>
                            <span className="stat-value">{worker.experience} {t('expert.years') || txt.years}</span>
                          </div>
                          <div className="expert-stat">
                            <span className="stat-label">{t('expert.region') || txt.location}</span>
                            <span className="stat-value">{worker.location}</span>
                          </div>
                        </div>

                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 'bold',
                            backgroundColor: worker.status === 'AVAILABLE' ? '#e8f5e9' : '#ffebee',
                            color: worker.status === 'AVAILABLE' ? '#2e7d32' : '#c62828',
                            border: `1px solid ${worker.status === 'AVAILABLE' ? '#a5d6a7' : '#ef9a9a'}`,
                          }}>
                            {worker.status === 'AVAILABLE' ? txt.available : txt.busy}
                          </span>
                        </div>
                      </div>

                      <div className="expert-card-footer">
                        <a
                          href={`tel:${worker.phone}`}
                          className="view-profile-btn"
                          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {txt.contact}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <div className="home-weather-panel"></div>
    </div>
  );
}
