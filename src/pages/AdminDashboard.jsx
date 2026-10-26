

import { useEffect, useState } from 'react';
import '../pages/AdminDashboard.css';
import adminApi from '../services/admin';
import { useTranslation } from '../i18n';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, experts: 0, pending: 0, posts: 0 });
  const [pendingExperts, setPendingExperts] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, lang } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const dashboard = await adminApi.getDashboard();
        setStats({
          users: dashboard.totalUsers,
          experts: dashboard.totalExperts,
          pending: dashboard.pendingRequests,
          posts: dashboard.activePosts,
        });
        setPendingExperts(dashboard.pendingExpertApplications || []);
        setReportedPosts(dashboard.reportedPosts || []);
      } catch (e) {
        setError(e.message || (t('admin.loadError') || 'Failed to load dashboard'));
      }
      setLoading(false);
    }
    fetchData();
  }, [t]);

  const handleApprove = async (id) => {
    await adminApi.approveExpert(id);
    setPendingExperts(pendingExperts.filter(e => e.id !== id));
  };
  const handleReject = async (id) => {
    await adminApi.rejectExpert(id);
    setPendingExperts(pendingExperts.filter(e => e.id !== id));
  };
  const handleRemovePost = async (id) => {
    await adminApi.removePost(id);
    setReportedPosts(reportedPosts.filter(p => p.id !== id));
  };

  if (loading) return <div>{t('common.loading') || 'Loading...'}</div>;
  if (error) return <div style={{ color: 'red' }}>{t('admin.error', { error: error }) || `Error: ${error}`}</div>;

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <h2>{t('admin.panelTitle') || 'Admin Panel'}</h2>
        <nav>
          <a href="#">{t('admin.dashboard') || 'Dashboard'}</a>
          <a href="#">{t('admin.users') || 'Users'}</a>
          <a href="#">{t('admin.expertRequests') || 'Expert Requests'}</a>
          <a href="#">{t('admin.posts') || 'Posts'}</a>
          <a href="#">{t('admin.services') || 'Services'}</a>
          <a href="#">{t('admin.reports') || 'Reports'}</a>
          <a href="#">{t('nav.settings') || 'Settings'}</a>
          <a href="#">{t('nav.logout') || 'Logout'}</a>
        </nav>
      </aside>
      <main className="admin-main">
        <h1>{t('admin.dashboard') || 'Dashboard'}</h1>
        <div className="admin-cards">
          <div className="admin-card"><div>{t('admin.totalUsers') || 'Total Users'}</div><div className="admin-card-num">{stats.users}</div></div>
          <div className="admin-card"><div>{t('admin.experts') || 'Experts'}</div><div className="admin-card-num">{stats.experts}</div></div>
          <div className="admin-card"><div>{t('admin.pendingRequests') || 'Pending Requests'}</div><div className="admin-card-num">{stats.pending}</div></div>
          <div className="admin-card"><div>{t('admin.activePosts') || 'Active Posts'}</div><div className="admin-card-num">{stats.posts}</div></div>
        </div>
        <section className="admin-section">
          <h2>{t('admin.pendingApplications') || 'Pending Expert Applications'}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('auth.name') || 'Name'}</th>
                <th>{t('expert.specialization') || 'Specialization'}</th>
                <th>{t('expert.experience') || 'Experience'}</th>
                <th>{t('admin.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {pendingExperts.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>{t('admin.noPending') || 'No pending applications'}</td></tr>
              ) : pendingExperts.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.specialization}</td>
                  <td>{e.experience} {t('expert.years') || 'Years'}</td>
                  <td>
                    <button className="approve" onClick={() => handleApprove(e.id)}>{t('admin.approve') || 'Approve'}</button>
                    <button className="reject" onClick={() => handleReject(e.id)}>{t('admin.reject') || 'Reject'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="admin-section">
          <h2>{t('admin.reportedPosts') || 'Reported Posts'}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.user') || 'User'}</th>
                <th>{t('admin.post') || 'Post'}</th>
                <th>{t('admin.reason') || 'Reason'}</th>
                <th>{t('admin.action') || 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {reportedPosts.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>{t('admin.noReports') || 'No reported posts'}</td></tr>
              ) : reportedPosts.map(p => (
                <tr key={p.id}>
                  <td>{p.user}</td>
                  <td>{p.post}</td>
                  <td>{p.reason}</td>
                  <td><button className="remove" onClick={() => handleRemovePost(p.id)}>{t('admin.remove') || 'Remove'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
