import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import expertApi from '../services/expert';
import * as usersApi from '../services/users';
import { useTranslation } from '../i18n';
import Sidebar from '../components/Sidebar';
import './Home.css'; // Reuse home layout styles
import SecureImage from '../components/SecureImage';

export default function ExpertList() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, lang } = useTranslation();

  useEffect(() => {
    async function loadExperts() {
      setLoading(true);
      try {
        // 1. Try fetching verified experts (merged profile data)
        let verified = [];
        if (expertApi && typeof expertApi.getVerifiedExperts === 'function') {
          try {
            verified = await expertApi.getVerifiedExperts();
          } catch (e) {
            console.warn('Verified experts API failed or empty', e);
          }
        }

        // 2. Fetch all users to ensure we don't miss any EXPERT role users who aren't "verified" yet
        let allUsers = [];
        if (usersApi && typeof usersApi.getAllUsers === 'function') {
          allUsers = await usersApi.getAllUsers();
        } else if (usersApi && usersApi.default && typeof usersApi.default.getAllUsers === 'function') {
          allUsers = await usersApi.default.getAllUsers();
        }
        
        if (!Array.isArray(allUsers)) allUsers = [];
        if (!Array.isArray(verified)) verified = [];

        const expertUsers = allUsers.filter(u => u && u.role === 'EXPERT');

        // 3. Merge lists. Prefer verified profile data if available.
        const verifiedMap = new Map();
        verified.forEach(v => {
          if (v && v.id) verifiedMap.set(v.id, v);
        });

        const combined = expertUsers.map(u => {
          if (verifiedMap.has(u.id)) {
            return verifiedMap.get(u.id);
          }
          // Return basic user info with defaults for expert fields
          return {
            ...u,
            specialization: u.specialization || 'General',
            cropExpertise: u.cropExpertise || 'All',
            yearsOfExperience: u.yearsOfExperience || 0,
            region: u.region || 'Unknown',
            bio: u.bio || '',
            isVerifiedExpert: false
          };
        });

        setExperts(combined);
      } catch (err) {
        setError(err.message || 'Failed to fetch experts');
      } finally {
        setLoading(false);
      }
    }
    loadExperts();
  }, []);

  const renderLayout = (content) => (
    <div className="home">
      <Sidebar />
      <main className="feed" style={{ maxWidth: '100%' }}>
        {content}
      </main>
      <div className="home-weather-panel"></div>
    </div>
  );

  if (loading) return renderLayout(<div style={{ padding: 32, textAlign: 'center' }}>{t('expert.loading') || 'Loading experts...'}</div>);
  if (error) return renderLayout(<div style={{ color: 'red', padding: 32, textAlign: 'center' }}>{error}</div>);

  return renderLayout(
    <div className="expert-list-container">
          <div className="expert-list-header">
            <h2>{t('expert.verifiedExperts') || 'Verified Experts'}</h2>
            <p className="expert-subtitle">{t('expert.subtitle') || 'Connect with agricultural professionals for personalized advice.'}</p>
          </div>

          {experts.length === 0 ? (
            <div className="no-experts">
              <div className="no-experts-icon">👨‍🌾</div>
              <p>{t('expert.noExpertsFound') || 'No verified experts found.'}</p>
            </div>
          ) : (
            <div className="expert-grid">
              {experts.map(expert => (
                <div key={expert.id} className="expert-card">
                  <div className="expert-card-header">
                    <div className="expert-avatar-wrapper" style={{ backgroundColor: expert.avatarColor || '#ccc' }}>
                      {expert.avatarUrl ? (
                        <SecureImage src={expert.avatarUrl} alt={expert.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      ) : (
                        <span className="expert-initial">{expert.name ? expert.name[0] : '?'}</span>
                      )}
                    </div>
                    <div className="expert-identity">
                      <h3 className="expert-name">
                        {expert.name}
                        {expert.isVerifiedExpert && (
                          <span className="verified-badge" title="Verified Expert">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          </span>
                        )}
                      </h3>
                      <span className="expert-specialization">{expert.specialization || (t('common.na') || 'Generalist')}</span>
                    </div>
                  </div>
                  
                  <div className="expert-card-body">
                    <div className="expert-stat-row">
                      <div className="expert-stat">
                        <span className="stat-label">{t('expert.experience') || 'Exp'}</span>
                        <span className="stat-value">{expert.yearsOfExperience || 0} {t('expert.years') || 'yrs'}</span>
                      </div>
                      <div className="expert-stat">
                        <span className="stat-label">{t('expert.region') || 'Region'}</span>
                        <span className="stat-value">{expert.region || (t('common.na') || 'N/A')}</span>
                      </div>
                    </div>

                    <div className="expert-expertise">
                      <span className="expertise-label">{t('expert.cropExpertise') || 'Focus'}:</span>
                      <span className="expertise-value">
                        {t(`crops.${(expert.cropExpertise||'').toLowerCase()}`) || expert.cropExpertise || (t('common.na') || 'All')}
                      </span>
                    </div>

                    <p className="expert-bio">
                      {expert.expertBio || expert.bio || (t('common.na') || 'No bio available.')}
                    </p>
                  </div>

                  <div className="expert-card-footer">
                    <Link
                      to={`/profile/${expert.id}`}
                      className="view-profile-btn"
                    >
                      {t('expert.viewProfile') || 'View Profile'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
