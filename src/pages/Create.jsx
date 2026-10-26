import NewPostForm from '../components/NewPostForm'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import './CreatePostModal.css'
import { useTranslation } from '../i18n'
import { addPost } from '../services/posts'

export default function Create() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const handleCreate = useCallback(async (data) => {
    if (typeof data === 'object' && data) {
      if (typeof data.preventDefault === 'function') data.preventDefault()
    }
    try {
      await addPost(data)
      if (window.history.length > 1) navigate(-1)
      else navigate('/home')
    } catch (e) {
      // Optionally show error toast or message
      alert(e.message || (t('home.postCreateError') || 'Failed to create post'))
    }
  }, [navigate])

  function handleClose(e) {
    if (e && e.target && e.target.classList.contains('create-post-modal-bg')) {
      navigate(-1)
    }
  }

  return (
    <div className="create-post-modal-bg" onClick={handleClose}>
      <div className="create-post-modal">
        <button className="create-post-close" onClick={() => navigate(-1)} aria-label={t('post.close') || 'Close'}>&times;</button>
        <h2 style={{marginTop:0,marginBottom:12,fontSize:'1.2em',textAlign:'center'}}>{t('post.createTitle') || 'Create Post'}</h2>
        <NewPostForm onCreate={handleCreate} />
      </div>
    </div>
  )
}
