import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NewPostForm from '../components/NewPostForm'
import ImagePostForm from '../components/ImagePostForm'
import Post from '../components/Post'
import * as api from '../services/posts'
import './Home.css'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../i18n'
import WeatherBox from '../components/WeatherBox'
import ActionBox from '../components/ActionBox'
import Sidebar from '../components/Sidebar'

export default function Home({ onlyExperts = false }) {
  // Use windowWidth to handle responsive logic for WeatherBox placement
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 1024;

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { user: currentUser } = useAuth()
  const { t, lang } = useTranslation()
  const location = useLocation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null)
  const feedRef = useRef(null)

  // Filters for Expert View
  const [filterCrop, setFilterCrop] = useState('')
  const [filterSeason, setFilterSeason] = useState('')
  const [filterIssue, setFilterIssue] = useState('')

  useEffect(() => {
    if (location?.state?.registered) {
      setFlash(t('common.registrationSuccess'))
      // clear flash after 4s
      setTimeout(() => setFlash(null), 4000)
    }
  }, [location, t])

  async function load() {
    setLoading(true)
    try {
      const p = await api.getPosts()
      if (onlyExperts) {
        setPosts(p.filter(post => {
          const role = post.authorRole || post.author_role || post.role || (post.author && post.author.role) || 'FARMER';
          return role === 'EXPERT';
        }))
      } else {
        setPosts(p)
      }
    } catch (e) {
      console.warn('Failed to load posts', e)
      setPosts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    // reload when current user becomes available
    if (currentUser) load()
  }, [currentUser, onlyExperts])

  async function handleCreate({ content, file, caption, crop, season, issueType }) {
    // Optimistic update: add post to UI immediately
    const tempId = 'temp-' + Date.now()
    const optimisticPost = {
      id: tempId,
      authorId: currentUser?.id,
      authorName: currentUser?.name || (t('common.you') || 'You'),
      content: content,
      caption: caption,
      crop,
      season,
      issueType,
      imageUrl: file ? URL.createObjectURL(file) : null,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      optimistic: true
    }
    setPosts((prev) => [optimisticPost, ...prev])
    // Scroll feed to top after adding post
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    let createdPost
    try {
      createdPost = await api.addPost({ content, file, caption, crop, season, issueType })
      // Replace optimistic post with real post from server
      setPosts((prev) => prev.map((p) => p.id === tempId ? { ...createdPost, optimistic: false } : p))
      setFlash(t('home.postCreated') || 'Post created')
      setTimeout(() => setFlash(null), 2000)
    } catch (e) {
      // Remove optimistic post
      setPosts((prev) => prev.filter((p) => p.id !== tempId))
      console.error('Failed to create post', e)
      setFlash(e && e.message ? e.message : (t('home.postCreateError') || 'Failed to create post'))
      setTimeout(() => setFlash(null), 3000)
    }
  }

  async function handleLike(postId) {
    // Optimistic update: toggle locally first
    let reverted = false
    setPosts((p) => p.map((x) => {
      if (x.id !== postId) return x
      const liked = x.likes.includes(currentUser.id)
      const newLikes = liked ? x.likes.filter(id => id !== currentUser.id) : [...x.likes, currentUser.id]
      return { ...x, likes: newLikes }
    }))

    try {
      const updated = await api.toggleLike(postId)
      setPosts((p) => p.map((x) => (x.id === postId ? updated : x)))
    } catch (e) {
      // revert optimistic update on error
      reverted = true
      if (e && e.status === 404) {
        setFlash(t('home.postRemoved') || 'Post was removed')
        setTimeout(() => setFlash(null), 3000)
        await load()
        return
      }
      if (e && e.status === 409) {
        setFlash(t('home.likeConflict') || 'Conflict saving like; reloading')
        setTimeout(() => setFlash(null), 3000)
        await load()
        return
      }
      // default
      setFlash(e && e.message ? e.message : (t('common.serverError') || 'Server error'))
      setTimeout(() => setFlash(null), 4000)
      await load()
    } finally {
      if (reverted) {
        await load()
      }
    }
  }

  async function handleComment(postId, text) {
    // Optimistic update: add comment locally
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p
      const fakeComment = {
        id: 'temp-' + Math.random().toString(36).slice(2),
        authorId: currentUser.id,
        authorName: currentUser.name,
        text,
        createdAt: new Date().toISOString(),
        isTemp: true
      }
      return { ...p, comments: [...(p.comments || []), fakeComment] }
    }))
    try {
      const newComment = await api.addComment(postId, text)
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p
        // Remove temp comments, add the new one
        const comments = (p.comments || []).filter(c => !c.isTemp)
        return { ...p, comments: [...comments, newComment] }
      }))
    } catch (e) {
      setFlash(t('home.commentAddError') || 'Failed to add comment')
      setTimeout(() => setFlash(null), 3000)
      await load()
    }
  }

  async function handleDeleteComment(postId, commentId) {
    // Optimistic update: remove comment from UI immediately
    let removedComment = null
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p
      const comments = (p.comments || [])
      const idx = comments.findIndex((c) => c.id === commentId)
      if (idx === -1) return p
      removedComment = comments[idx]
      return { ...p, comments: comments.filter((c) => c.id !== commentId) }
    }))
    try {
      await api.deleteComment(postId, commentId)
    } catch (e) {
      // Revert: restore comment if delete fails
      setPosts((prev) => prev.map((p) => {
        if (p.id !== postId) return p
        return { ...p, comments: [...(p.comments || []), removedComment].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) }
      }))
      setFlash(t('home.commentDeleteError') || 'Failed to delete comment')
      setTimeout(() => setFlash(null), 3000)
    }
  }

  async function handleEdit(postId, updates) {
    // Optimistic update: update post in UI immediately
    let prevPost
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p
      prevPost = p
      return { ...p, ...updates }
    }))
    try {
      const updated = await api.updatePost(postId, updates)
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...updated } : p))
    } catch (e) {
      // Revert to previous post on error
      setPosts((prev) => prev.map((p) => p.id === postId ? prevPost : p))
      setFlash(e && e.message ? e.message : (t('home.postUpdateError') || 'Failed to update post'))
      setTimeout(() => setFlash(null), 3000)
    }
  }

  async function handleDelete(postId) {
    if (!confirm(t('common.deleteConfirm'))) return
    // Optimistic update: remove post from UI immediately
    let removedPost
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === postId)
      if (idx === -1) return prev
      removedPost = prev[idx]
      return prev.filter((p) => p.id !== postId)
    })
    try {
      await api.deletePost(postId)
    } catch (e) {
      // Revert: restore post if delete fails
      setPosts((prev) => [removedPost, ...prev])
      setFlash(e && e.message ? e.message : (t('home.postDeleteError') || 'Failed to delete post'))
      setTimeout(() => setFlash(null), 3000)
    }
  }

  // Hide welcome after 5s on mobile
  useEffect(() => {
    if (window.innerWidth <= 600 && showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  const navigate = useNavigate()
  const { logout } = useAuth()
  const currentPath = location.pathname

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filter posts logic
  const displayedPosts = posts.filter(p => {
    if (onlyExperts && filterCrop && p.crop !== filterCrop) return false;
    if (onlyExperts && filterSeason && p.season !== filterSeason) return false;
    if (onlyExperts && filterIssue && p.issueType !== filterIssue) return false;
    return true;
  });

  return (
    <div className="home">
      {/* Left Sidebar Navigation (Desktop Only) */}
      <Sidebar />

      {/* Main Feed (center column) */}
      <main className="feed" ref={feedRef}>
        {/* WeatherBox for mobile/tablet view at the top, above create post */}
        {windowWidth < 1280 && (
          <div className="weather-panel-card mobile-weather-panel">
            <WeatherBox />
          </div>
        )}
        {flash && <div className="flash success">{flash}</div>}
        
        {/* Show Create Post only for normal feed OR if user is expert in expert feed */}
        {(!onlyExperts || (currentUser?.role === 'EXPERT')) && (
          <div className="new-post-form-wrapper">
            <NewPostForm onCreate={handleCreate} />
          </div>
        )}

        {/* Filters for Expert View */}
        {onlyExperts && (
          <div className="expert-filters">
            <select value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}>
              <option value="">{t('home.allCrops') || 'All Crops'}</option>
              <option value="Cotton">{t('crops.cotton') || 'Cotton'}</option>
              <option value="Soybean">{t('crops.soybean') || 'Soybean'}</option>
              <option value="Wheat">{t('crops.wheat') || 'Wheat'}</option>
              <option value="Rice">{t('crops.rice') || 'Rice'}</option>
              <option value="Maize">{t('crops.maize') || 'Maize'}</option>
              <option value="Sugarcane">{t('crops.sugarcane') || 'Sugarcane'}</option>
              <option value="Other">{t('crops.other') || 'Other'}</option>
            </select>
            <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}>
              <option value="">{t('home.allSeasons') || 'All Seasons'}</option>
              <option value="Kharif">{t('seasons.kharif') || 'Kharif'}</option>
              <option value="Rabi">{t('seasons.rabi') || 'Rabi'}</option>
              <option value="Summer">{t('seasons.summer') || 'Summer'}</option>
            </select>
            <select value={filterIssue} onChange={(e) => setFilterIssue(e.target.value)}>
              <option value="">{t('home.allIssues') || 'All Issues'}</option>
              <option value="Pest">{t('issues.pest') || 'Pest'}</option>
              <option value="Disease">{t('issues.disease') || 'Disease'}</option>
              <option value="Fertilizer">{t('issues.fertilizer') || 'Fertilizer'}</option>
              <option value="Irrigation">{t('issues.irrigation') || 'Irrigation'}</option>
            </select>
          </div>
        )}

        {loading ? (
          <div>{t('home.loading')}</div>
        ) : (
          displayedPosts.map((p) => {
            // Fallback logic for expert badge fields
            const postWithExpertFields = {
              ...p,
              authorRole: p.authorRole || p.author_role || p.role || (p.author && p.author.role) || 'FARMER',
              isVerifiedExpert: typeof p.isVerifiedExpert !== 'undefined' ? p.isVerifiedExpert : (p.author && p.author.isVerifiedExpert) || false
            };
            return (
              <Post
                key={postWithExpertFields.id}
                post={postWithExpertFields}
                currentUser={currentUser}
                onLike={handleLike}
                onComment={handleComment}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeleteComment={handleDeleteComment}
                showComments={openCommentsPostId === p.id}
                onToggleComments={() => setOpenCommentsPostId(openCommentsPostId === p.id ? null : p.id)}
              />
            );
          })
        )}
      </main>

      {/* Right Panel (Desktop Only) */}
      {!isMobile && (
        <aside className="home-weather-panel">
          {windowWidth >= 1280 && (
            <div className="weather-panel-card" style={{ marginBottom: 24 }}>
              <WeatherBox />
            </div>
          )}
          <div className="weather-panel-card">
            <ActionBox />
          </div>
        </aside>
      )}
    </div>
  )
}
