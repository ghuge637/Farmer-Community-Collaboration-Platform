import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LikeButton from './LikeButton'
import CommentList from './CommentList'
import { useTranslation } from '../i18n' 
import { MdFavoriteBorder, MdFavorite, MdComment, MdShare, MdContentCopy, MdVerified } from 'react-icons/md'
import SecureImage from './SecureImage'

export default function Post({ post, currentUser, onLike, onComment, onEdit, onDelete, onDeleteComment, showComments, onToggleComments }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(post.caption ?? post.content ?? '')
  const [showMenu, setShowMenu] = useState(false)
  const { t, lang } = useTranslation()
  const [shareMsg, setShareMsg] = useState(false)

  useEffect(() => {
    // When entering edit mode, ensure draft contains latest caption/content
    if (editing) {
      setDraft(post.caption ?? post.content ?? '')
    }
  }, [editing, post.caption, post.content])

  // toggleComments is now controlled by parent

  function save() {
    onEdit(post.id, { content: draft && draft.trim() ? draft.trim() : null })
    setEditing(false)
  }

  function handleShare() {
    const url = window.location.origin + '/post/' + post.id
    const shareData = {
      title: post.caption || post.content || t('nav.brand'),
      text: post.caption || post.content || '',
      url
    }
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => setShareMsg(t('post.shared') || 'Shared!'))
        .catch(() => setShareMsg(t('post.linkCopied') || 'Link copied!'))
      setTimeout(() => setShareMsg(false), 2000)
    } else {
      navigator.clipboard.writeText(url)
      setShareMsg(t('post.linkCopied') || 'Link copied!')
      setTimeout(() => setShareMsg(false), 2000)
    }
  }

  function doWebShare() {
    const url = window.location.origin + '/post/' + post.id
    const shareData = {
      title: post.caption || post.content || t('nav.brand'),
      text: post.caption || post.content || '',
      url
    }
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => setShareMsg(t('post.shared') || 'Shared!'))
        .catch(() => setShareMsg(t('post.linkCopied') || 'Link copied!'))
      setTimeout(() => setShareMsg(false), 2000)
    }
  }

  function copyLink() {
    const url = window.location.origin + '/post/' + post.id
    navigator.clipboard.writeText(url)
    setShareMsg(t('post.linkCopied') || 'Link copied!')
    setShowShare(false)
    setTimeout(() => setShareMsg(false), 2000)
  }

  function isVideoUrl(url) {
    if (!url) return false
    const lower = url.toLowerCase()
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || 
           lower.endsWith('.avi') || lower.endsWith('.mkv') || lower.endsWith('.3gp') || 
           lower.endsWith('.ogg') || lower.includes('/video/')
  }

  const isVideo = isVideoUrl(post.imageUrl)

  return (
    <div className="post">
      {post.authorRole === 'EXPERT' && (
        <div className="expert-advice-label">{t('post.expertAdvice') || 'Expert Advice'}</div>
      )}
      <div className="post-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to={`/profile/${post.authorId}`} className="author-link"><strong>{post.authorName}</strong></Link>
          {post.authorRole === 'EXPERT' && post.isVerifiedExpert && (
            <MdVerified size={18} color="#2E7D32" style={{ marginLeft: 4 }} title={t('post.verifiedExpert') || "Verified Expert"} />
          )}
        </div>
        {currentUser && currentUser.id === post.authorId && (
          <div className="post-menu-wrapper" style={{ position: 'relative', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <button
              className="post-menu-btn"
              aria-label={t('post.menu') || "Post menu"}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, minHeight: 32 }}
              onClick={e => {
                e.stopPropagation();
                setShowMenu(m => !m);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#111" aria-hidden="true">
                <circle cx="12" cy="5" r="2.1" />
                <circle cx="12" cy="12" r="2.1" />
                <circle cx="12" cy="19" r="2.1" />
              </svg>
            </button>
            {showMenu && (
              <div className="post-menu-dropdown" style={{ position: 'absolute', right: 0, top: 32, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, minWidth: 120 }}>
                <button style={{ display: 'block', width: '100%', padding: '10px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', color: '#2E7D32' }} onClick={() => { setEditing(true); setShowMenu(false); }}>{t('post.edit') || 'Edit'}</button>
                <button style={{ display: 'block', width: '100%', padding: '10px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#d32f2f', fontSize: '1rem' }} onClick={() => { onDelete(post.id); setShowMenu(false); }}>{t('post.delete') || 'Delete'}</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-body">
        {editing ? (
          <>
            {post.imageUrl && (
              <div style={{ marginBottom: 8 }}>
                {isVideo ? (
                  <video src={post.imageUrl} controls className="post-video" style={{ width: '100%', maxHeight: 480, borderRadius: 8, backgroundColor: '#000' }} />
                ) : (
                  <SecureImage src={post.imageUrl} alt={post.caption || post.content || 'media'} style={{ maxWidth: '100%', maxHeight: 480 }} />
                )}
              </div>
            )}
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} style={{ width: '100%', minHeight: 60, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={save} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>{t('post.saveChanges') || 'Save Changes'}</button>
              <button onClick={() => setEditing(false)} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>{t('post.cancelEdit') || 'Cancel Edit'}</button>
            </div>
          </>
        ) : (
          <>
            {post.imageUrl && (
              <div style={{ marginBottom: 8 }}>
                {isVideo ? (
                  <video src={post.imageUrl} controls className="post-video" style={{ width: '100%', maxHeight: 480, borderRadius: 8, backgroundColor: '#000' }} />
                ) : (
                  <SecureImage src={post.imageUrl} alt={post.caption || 'media'} style={{ maxWidth: '100%', maxHeight: 480 }} />
                )}
              </div>
            )}
            {post.caption ? <p>{post.caption}</p> : <p>{post.content}</p>}
          </>
        )}
        
        {(post.crop || post.season || post.issueType) && (
          <div className="post-tags">
            {post.crop && <span className="tag crop">{t(`crops.${post.crop.toLowerCase()}`) || post.crop}</span>}
            {post.season && <span className="tag season">{t(`seasons.${post.season.toLowerCase()}`) || post.season}</span>}
            {post.issueType && <span className="tag issue">{t(`issues.${post.issueType.toLowerCase()}`) || post.issueType}</span>}
          </div>
        )}
      </div>

      <div className="post-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0 }}>
        {/* Like left */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <button className="like-btn" onClick={() => onLike(post.id)} title={t('post.like')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {currentUser && post.likes.includes(currentUser.id) ? <MdFavorite size={22} color="#e53935" /> : <MdFavoriteBorder size={22} color="#888" />}
            <span className="count">{post.likes.length}</span>
          </button>
        </div>
        {/* Comment middle */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button className={`comment-btn${showComments ? ' active' : ''}`} onClick={onToggleComments} title={t('post.comment')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MdComment size={22} color={showComments ? '#2E7D32' : '#888'} />
            <span className="count">{post.comments.length}</span>
          </button>
        </div>
        {/* Share right */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="share-btn" onClick={handleShare} title={t('post.share')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MdShare size={22} color="#1976d2" />
          </button>
        </div>
      </div>
      {/* Share dialog removed for direct share */}
      {shareMsg && (
        <div style={{ textAlign: 'center', color: '#1976d2', fontSize: 14, marginTop: 4 }}>{t('post.linkCopied') || 'Link copied!'}</div>
      )}

      {showComments && (
        <CommentList comments={post.comments} onAdd={(text) => onComment(post.id, text)} currentUser={currentUser} postAuthorId={post.authorId} onDelete={(commentId) => onDeleteComment && onDeleteComment(post.id, commentId)} />
      )}
    </div>
  )
}
