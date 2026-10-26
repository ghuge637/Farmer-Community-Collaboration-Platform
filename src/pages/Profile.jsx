import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as usersApi from '../services/users'
import * as postsApi from '../services/posts'
import * as followApi from '../services/follow'
import * as coursesApi from '../services/courses'
import { uploadAvatar, uploadCover } from '../services/userUploads'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../i18n'
import Post from '../components/Post'
import './Profile.css'
import { MdVerified, MdLocationOn, MdCalendarToday, MdWork, MdSchool, MdGridOn, MdInfoOutline, MdEdit, MdAdd, MdCameraAlt } from 'react-icons/md'
import SecureImage from '../components/SecureImage'
import Sidebar from '../components/Sidebar'

export default function Profile() {
  const { id: routeId } = useParams()
  const { user: currentUser, logout } = useAuth()
  const { t, lang } = useTranslation()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [courses, setCourses] = useState([])
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: '', bio: '', region: '' })
  const [followInProgress, setFollowInProgress] = useState(false)
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    mode: 'ONLINE',
    duration: '',
    price: '',
    contactPhone: '',
    contactWhatsApp: '',
    contactEmail: '',
    enabled: true
  });
  const [courseError, setCourseError] = useState(null);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  
  const [hasApplied, setHasApplied] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => { load() }, [routeId, currentUser])

  async function load() {
    const uid = routeId || (currentUser && currentUser.id)
    if (!uid) return
    try {
      const u = await usersApi.getUser(uid)
      const p = await postsApi.getPostsByAuthor(uid)
      const c = await coursesApi.getCoursesByExpert(uid)
      setUser(u)
      setPosts(p)
      setCourses(Array.isArray(c) ? c : [])
      setDraft({ name: u?.name || '', bio: u?.bio || '', region: u?.region || '' })
      // Check if user has already applied (if backend provides this info, otherwise rely on local state for session)
      // Assuming user object might have expertStatus or similar if implemented in backend
      if (u?.expertStatus === 'PENDING' || u?.verificationStatus === 'PENDING') setHasApplied(true);
    } catch (e) {
      // handle unauthorized or server errors gracefully
      console.warn('Failed to load profile', e)
      setUser(null)
      setPosts([])
      setCourses([])
    }
  }

  async function handleFollowToggle() {
    if (!user) return
    if (!currentUser) {
      // Not logged in: you could redirect to login here
      alert(t('profile.loginToFollow') || 'Please log in to follow users')
      return
    }
    setFollowInProgress(true)
    // Optimistic update
    setUser((prev) => ({ ...prev, isFollowing: !prev.isFollowing, followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1 }))
    try {
      if (user.isFollowing) {
        await followApi.unfollowUser(user.id)
      } else {
        await followApi.followUser(user.id)
      }
      await load()
    } catch (e) {
      console.warn('Follow toggle failed', e)
      // revert
      await load()
    } finally {
      setFollowInProgress(false)
    }
  }

  async function save() {
    await usersApi.updateUser(user.id, draft)
    setEditing(false)
    await load()
  }

  function handleCourseFormChange(e) {
    const { name, value, type, checked } = e.target;
    setCourseForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleCourseSubmit(e) {
    e.preventDefault();
    setCourseError(null);
    setCourseSubmitting(true);
    if (!courseForm.title || !courseForm.description || !courseForm.mode) {
      setCourseError(t('profile.fillAllFields') || 'Please fill all required fields.');
      setCourseSubmitting(false);
      return;
    }
    try {
      await coursesApi.createCourse(courseForm);
      setShowCourseForm(false);
      setCourseForm({ title: '', description: '', mode: 'ONLINE', duration: '', price: '', contactPhone: '', contactWhatsApp: '', contactEmail: '', enabled: true });
      await load();
      alert(t('profile.courseCreated') || 'Course created successfully!');
    } catch (err) {
      setCourseError(err.message || (t('profile.courseCreateFailed') || 'Failed to create course.'));
    }
    setCourseSubmitting(false);
  }

  function handleCoverFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(t('common.invalidFileType') || 'Please select an image file');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSaveCover() {
    if (!coverFile) return;
    setUploadingCover(true);
    try {
      await uploadCover(user.id, coverFile);
      setCoverPreview(null);
      setCoverFile(null);
      await load();
      alert('Cover updated successfully!');
    } catch (err) {
      console.error('Failed to upload cover', err);
      alert((t('errors.uploadFailed') || 'Upload failed') + ': ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  }

  function handleCancelCover() {
    setCoverPreview(null);
    setCoverFile(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  async function handleImageUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert(t('common.invalidFileType') || 'Please select an image file');
      return;
    }

    try {
      if (type === 'avatar') {
        await uploadAvatar(user.id, file);
      } else if (type === 'cover') {
        await uploadCover(user.id, file);
      }
      await load(); // Reload to show new image
    } catch (err) {
      console.error(`Failed to upload ${type}`, err);
      let msg = t('errors.uploadFailed') || 'Upload failed';
      if (err.message === 'Unauthorized' || (err.message && err.message.includes('401'))) {
        msg = t('auth.sessionExpired') || 'Session expired. Please login again.';
        logout();
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      alert(msg);
    }
  }

  if (!user) return <div className="profile-page" style={{padding: 20, textAlign: 'center'}}>{t('home.loading')}</div>

  const isMe = currentUser && currentUser.id === user.id;
  const isExpert = user.role === 'EXPERT';
  const isVerified = isExpert && user.isVerifiedExpert;
  const isFarmer = user.role === 'FARMER';
  const isAdmin = user.role === 'ADMIN';

  // CSS Styles injected
  const styles = `
    .profile-wrapper { width: 100%; }
    .profile-container { max-width: 800px; margin: 0 auto; background: #fff; min-height: 100vh; padding-bottom: 80px; }
    .profile-cover { height: 160px; position: relative; background: #eee; }
    .profile-header { padding: 0 20px; position: relative; }
    .profile-avatar-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: -50px; margin-bottom: 12px; }
    .profile-avatar { width: 100px; height: 100px; border-radius: 50%; border: 4px solid #fff; background: #eee; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 40px; color: #2E7D32; font-weight: bold; position: relative; z-index: 2; cursor: default; }
    .profile-actions { display: flex; gap: 8px; padding-bottom: 10px; }
    .profile-btn { padding: 6px 16px; border-radius: 20px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px; }
    .profile-btn:active { transform: scale(0.96); }
    .btn-primary { background: #2E7D32; color: white; }
    .btn-secondary { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
    .btn-outline { background: transparent; border: 1px solid #2E7D32; color: #2E7D32; }
    .profile-info { padding: 0 20px 10px; }
    .profile-name { font-size: 22px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 6px; color: #1a1a1a; }
    .profile-role { font-size: 14px; color: #666; margin-bottom: 8px; display: flex; align-items: center; gap: 4px; }
    .profile-bio { font-size: 15px; line-height: 1.5; color: #333; margin-bottom: 12px; white-space: pre-wrap; }
    .profile-stats { display: flex; gap: 20px; font-size: 14px; color: #555; border-top: 1px solid #f0f0f0; padding-top: 12px; margin-top: 12px; }
    .stat-item { display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-weight: 700; color: #000; font-size: 16px; }
    .stat-label { font-size: 12px; color: #777; }
    .profile-tabs { display: flex; border-bottom: 1px solid #eee; margin-top: 10px; position: sticky; top: 0; background: #fff; z-index: 10; }
    .profile-tab { flex: 1; text-align: center; padding: 14px; font-weight: 600; color: #777; cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .profile-tab.active { color: #2E7D32; }
    .profile-tab.active::after { content: ''; position: absolute; bottom: 0; left: 20%; width: 60%; height: 3px; background: #2E7D32; border-radius: 3px 3px 0 0; }
    .profile-content { background: #f8f9fa; min-height: 300px; padding: 16px; }
    .edit-form { background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    .edit-input { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit; }
    .edit-textarea { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit; min-height: 80px; resize: vertical; }
    .course-card { background: #fff; border-radius: 10px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #eee; }
    .course-title { font-weight: 700; font-size: 18px; margin-bottom: 4px; color: #2E7D32; }
    .course-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #666; margin: 8px 0; }
    .course-meta-item { display: flex; align-items: center; gap: 4px; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; }
    .empty-state { text-align: center; padding: 40px 20px; color: #888; }
    
    .edit-cover-btn { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 20px; padding: 6px 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; transition: background 0.2s; z-index: 5; }
    .edit-cover-btn:hover { background: rgba(0,0,0,0.8); }
    .cover-actions { position: absolute; bottom: 10px; right: 10px; display: flex; gap: 8px; z-index: 5; }
    .avatar-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer; border-radius: 50%; }
    .profile-avatar:hover .avatar-overlay { opacity: 1; }

    @media (min-width: 1024px) {
      .profile-wrapper { padding-left: 220px; background: #f5f7fa; min-height: 100vh; }
      .profile-container { margin: 0 auto; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    }
    @media (min-width: 1280px) {
      .profile-wrapper { padding-left: 240px; }
    }

    @media (max-width: 600px) {
      .profile-avatar-row { margin-top: -60px; }
      .profile-avatar { width: 120px; height: 120px; }
      .profile-header { padding: 0 10px; }
      .profile-info { padding: 0 15px 10px; }
      .profile-name { font-size: 20px; }
      .profile-content { padding: 0; }
      .profile-container { padding-bottom: 60px; }
    }
  `;

  return (
    <div className="profile-wrapper">
      <Sidebar />
      <div className="profile-container">
      <style>{styles}</style>
      
      {/* Cover Image */}
      <div className="profile-cover">
        {coverPreview ? (
          <img src={coverPreview} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: uploadingCover ? 0.7 : 1 }} />
        ) : user.coverUrl ? (
          <SecureImage src={user.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2E7D32, #81c784)' }}></div>
        )}
        {isMe && (
          <>
            {coverPreview ? (
              <div className="cover-actions">
                <button className="profile-btn btn-primary" onClick={handleSaveCover} disabled={uploadingCover}>{uploadingCover ? (t('common.submitting') || 'Submitting...') : (t('post.save') || 'Save')}</button>
                <button className="profile-btn btn-secondary" onClick={handleCancelCover} disabled={uploadingCover}>{t('common.cancel') || 'Cancel'}</button>
              </div>
            ) : (
              <button className="edit-cover-btn" onClick={() => coverInputRef.current.click()}><MdCameraAlt /> {t('profile.editCover') || 'Edit Cover'}</button>
            )}
            <input type="file" ref={coverInputRef} onChange={handleCoverFileChange} style={{ display: 'none' }} accept="image/*" />
          </>
        )}
      </div>

      <div className="profile-header">
        <div className="profile-avatar-row">
          <div className="profile-avatar" style={{ background: user.avatarColor || '#eee' }}>
            {user.avatarUrl ? (
              <SecureImage src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name ? user.name[0].toUpperCase() : '?'
            )}
            {isMe && (
              <>
                <div className="avatar-overlay" onClick={() => avatarInputRef.current.click()}><MdCameraAlt size={24} color="#fff" /></div>
                <input type="file" ref={avatarInputRef} onChange={(e) => handleImageUpload(e, 'avatar')} style={{ display: 'none' }} accept="image/*" />
              </>
            )}
          </div>
          <div className="profile-actions">
            {!isMe && !isAdmin && (
              <button 
                disabled={followInProgress} 
                onClick={handleFollowToggle} 
                className={`profile-btn ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {user.isFollowing ? (t('profile.unfollow') || 'Unfollow') : (t('profile.follow') || 'Follow')}
              </button>
            )}
            {isMe && !isAdmin && (
              <>
                {isFarmer && !hasApplied && (
                  <Link to="/expert-apply" className="profile-btn btn-primary" style={{textDecoration: 'none'}}>
                    {t('expert.applyBtn') || 'Become Expert'}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="profile-info">
          {editing ? (
            <div className="edit-form">
              <h3 style={{marginTop:0, marginBottom: 12}}>{t('profile.editProfile')}</h3>
              <label style={{fontSize: 12, fontWeight: 600, color: '#666'}}>{t('profile.editName') || 'Name'}</label>
              <input className="edit-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
              
              <label style={{fontSize: 12, fontWeight: 600, color: '#666'}}>{t('expert.region') || 'Region'}</label>
              <input className="edit-input" value={draft.region} onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))} placeholder="e.g. Pune, Maharashtra" />

              <label style={{fontSize: 12, fontWeight: 600, color: '#666'}}>{t('profile.editBio') || 'Bio'}</label>
              <textarea className="edit-textarea" value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} />
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={save} className="profile-btn btn-primary">{t('post.save') || 'Save'}</button>
                <button onClick={() => setEditing(false)} className="profile-btn btn-secondary">{t('post.cancel') || 'Cancel'}</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="profile-name">
                  {user.name}
                  {isVerified && <MdVerified size={20} color="#2E7D32" title={t('post.verifiedExpert')} />}
                </h1>
                {isMe && !isAdmin && (
                  <button onClick={() => setEditing(!editing)} className="profile-btn btn-secondary" style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', justifyContent: 'center' }} title={t('profile.editProfile') || 'Edit Profile'}>
                    <MdEdit size={20} />
                  </button>
                )}
              </div>
              <div className="profile-role">
                {isExpert ? (
                  <span style={{color: '#2E7D32', fontWeight: 600}}>{t('expert.expert') || 'Agricultural Expert'}</span>
                ) : (
                  <span>{user.role || 'Farmer'}</span>
                )}
                {user.region && (
                  <>
                    <span>•</span>
                    <span style={{display: 'flex', alignItems: 'center'}}><MdLocationOn size={14} /> {user.region}</span>
                  </>
                )}
              </div>
              
              {user.bio && <p className="profile-bio">{user.bio}</p>}

              {isExpert && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {user.specialization && <span className="expert-badge"><MdWork size={12} style={{verticalAlign: -1}}/> {user.specialization}</span>}
                  {user.cropExpertise && <span className="expert-badge"><MdSchool size={12} style={{verticalAlign: -1}}/> {t(`crops.${user.cropExpertise.toLowerCase()}`) || user.cropExpertise}</span>}
                  {user.yearsOfExperience > 0 && <span className="expert-badge"><MdCalendarToday size={12} style={{verticalAlign: -1}}/> {user.yearsOfExperience} {t('expert.years') || 'yrs'}</span>}
                </div>
              )}

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">{t('profile.posts') || 'Posts'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.followersCount || 0}</span>
                  <span className="stat-label">{t('profile.followers') || 'Followers'}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <div className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
          <MdGridOn /> {t('profile.posts') || 'Posts'}
        </div>
        {isExpert && (
          <div className={`profile-tab ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <MdSchool /> {t('nav.services') || 'Services'}
          </div>
        )}
        <div className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          <MdInfoOutline /> {t('profile.about') || 'About'}
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-grid">
            {posts.length === 0 ? (
              <div className="empty-state">
                <div style={{fontSize: 40, marginBottom: 10}}>📷</div>
                <p>{t('profile.noPosts') || 'No posts yet'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {posts.map((p) => (
                  <Post
                    key={p.id}
                    post={p}
                    currentUser={currentUser}
                    onLike={async (id) => { await postsApi.toggleLike(id); await load() }}
                    onComment={async (id, text) => { await postsApi.addComment(id, text); await load() }}
                    onEdit={async (id, updates) => { await postsApi.updatePost(id, updates); await load() }}
                    onDelete={async (id) => { if (!confirm(t('common.deleteConfirm'))) return; await postsApi.deletePost(id); await load() }}
                    onDeleteComment={async (postId, commentId) => { await postsApi.deleteComment(postId, commentId); await load() }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && isExpert && (
          <div>
            {(isMe && isVerified) && !showCourseForm && (
              <button 
                onClick={() => setShowCourseForm(true)}
                className="profile-btn btn-primary"
                style={{width: '100%', justifyContent: 'center', marginBottom: 16, padding: '12px'}}
              >
                <MdAdd size={20} /> {t('profile.addNewCourse') || 'Add New Course'}
              </button>
            )}

            {showCourseForm && (
              <form onSubmit={handleCourseSubmit} className="edit-form" style={{border: '1px solid #4caf50'}}>
                <h4 style={{ marginTop: 0, marginBottom: 12, color: '#2E7D32' }}>{t('profile.createNewCourse') || 'Create New Course'}</h4>
                
                <label style={{fontSize: 12, fontWeight: 600}}>{t('profile.courseTitle') || 'Title'} *</label>
                <input className="edit-input" name="title" value={courseForm.title} onChange={handleCourseFormChange} required />
                
                <label style={{fontSize: 12, fontWeight: 600}}>{t('profile.courseDescription') || 'Description'} *</label>
                <textarea className="edit-textarea" name="description" value={courseForm.description} onChange={handleCourseFormChange} required />
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                  <div>
                    <label style={{fontSize: 12, fontWeight: 600}}>{t('profile.courseMode') || 'Mode'} *</label>
                    <select className="edit-input" name="mode" value={courseForm.mode} onChange={handleCourseFormChange} required>
                  <option value="ONLINE">{t('profile.modeOnline') || 'Online'}</option>
                  <option value="OFFLINE">{t('profile.modeOffline') || 'Offline'}</option>
                  <option value="FIELD">{t('profile.modeField') || 'Field'}</option>
                </select>
              </div>
                  <div>
                    <label style={{fontSize: 12, fontWeight: 600}}>{t('profile.courseDuration') || 'Duration'}</label>
                    <input className="edit-input" name="duration" value={courseForm.duration} onChange={handleCourseFormChange} placeholder="e.g. 2 hours" />
                  </div>
                </div>

                <label style={{fontSize: 12, fontWeight: 600}}>{t('profile.coursePrice') || 'Price'}</label>
                <input className="edit-input" name="price" value={courseForm.price} onChange={handleCourseFormChange} placeholder="e.g. ₹500 or Free" />
                
                <label style={{fontSize: 12, fontWeight: 600}}>{t('profile.contactWhatsApp') || 'WhatsApp Number'}</label>
                <input className="edit-input" name="contactWhatsApp" value={courseForm.contactWhatsApp} onChange={handleCourseFormChange} placeholder="919876543210" />

                {courseError && <div style={{ color: 'red', marginBottom: 10, fontSize: 14 }}>{courseError}</div>}
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={courseSubmitting} className="profile-btn btn-primary" style={{flex: 1, justifyContent: 'center'}}>
                    {courseSubmitting ? (t('common.submitting') || '...') : (t('profile.createCourseBtn') || 'Create')}
                  </button>
                  <button type="button" onClick={() => setShowCourseForm(false)} className="profile-btn btn-secondary" style={{flex: 1, justifyContent: 'center'}}>
                    {t('common.cancel') || 'Cancel'}
                  </button>
                </div>
              </form>
            )}

            {courses.length === 0 && !showCourseForm ? (
              <div className="empty-state">
                <p>{t('profile.noCourses') || 'No courses or services listed yet.'}</p>
              </div>
            ) : (
              courses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-title">{course.title}</div>
                  <div style={{ fontSize: 14, color: '#444', marginBottom: 8 }}>{course.description}</div>
                  
                  <div className="course-meta">
                    <span className="course-meta-item">
                      {course.mode === 'ONLINE' ? '💻' : course.mode === 'OFFLINE' ? '🏢' : '🌾'} 
                      {t(`profile.mode${course.mode.charAt(0).toUpperCase() + course.mode.slice(1).toLowerCase()}`) || course.mode}
                    </span>
                    {course.duration && <span className="course-meta-item">⏱️ {course.duration}</span>}
                    {course.price && <span className="course-meta-item" style={{color: '#2E7D32', fontWeight: 600}}>🏷️ {course.price}</span>}
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                    {course.contactWhatsApp && (
                      <a href={`https://wa.me/${course.contactWhatsApp}`} target="_blank" rel="noopener noreferrer" className="profile-btn btn-outline" style={{textDecoration: 'none', fontSize: 13, padding: '4px 12px'}}>
                        Chat on WhatsApp
                      </a>
                    )}
                    {course.contactPhone && (
                      <a href={`tel:${course.contactPhone}`} className="profile-btn btn-outline" style={{textDecoration: 'none', fontSize: 13, padding: '4px 12px'}}>
                        Call
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
            <h3 style={{marginTop: 0, fontSize: 18}}>{t('profile.about')}</h3>
            <p style={{color: '#555', lineHeight: 1.6}}>
              {user.bio || (t('profile.noBio') || 'No bio available.')}
            </p>
            
            <div style={{marginTop: 20}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#555'}}>
                <MdLocationOn size={20} color="#777" />
                <span>{user.region || 'Region not specified'}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#555'}}>
                <MdCalendarToday size={20} color="#777" />
                <span>Joined {new Date().getFullYear()}</span> {/* Placeholder for joined date if not in user obj */}
              </div>
              {isExpert && (
                <>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#555'}}>
                    <MdWork size={20} color="#777" />
                    <span>{user.specialization}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: '#555'}}>
                    <MdSchool size={20} color="#777" />
                    <span>Expert in {user.cropExpertise}</span>
                  </div>
                </>
              )}
            </div>
            
            {isMe && (
               <div style={{marginTop: 30, borderTop: '1px solid #eee', paddingTop: 20}}>
                 <button onClick={() => setShowLogoutConfirm(true)} className="profile-btn" style={{color: '#d32f2f', background: '#ffebee', width: '100%', justifyContent: 'center'}}>
                   {t('nav.logout') || 'Log Out'}
                 </button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
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
    </div>
    </div>
  );
}
