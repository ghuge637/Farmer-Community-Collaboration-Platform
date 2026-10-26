import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../i18n'
import { useAuth } from '../context/AuthContext'
import './NewPostForm.css' // We will add this below

export default function NewPostForm({ onCreate, initialType = 'text' }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [crop, setCrop] = useState('')
  const [season, setSeason] = useState('')
  const [issueType, setIssueType] = useState('')
  
  const fileInputRef = useRef(null)
  const { t, lang } = useTranslation()

  // Automatically open file picker if user clicked "Photo" button on Home
  useEffect(() => {
    if (initialType === 'photo' && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [initialType])

  const [fileType, setFileType] = useState(null) // 'image' | 'video'

  function onFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    
    const isImage = f.type.startsWith('image/')
    const isVideo = f.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setError(t('common.invalidFileType') || 'Only images (PNG, JPG, WebP) and videos (MP4, WebM, MOV) are allowed')
      return
    }

    // 100MB limit
    if (f.size > 100 * 1024 * 1024) {
      setError(t('common.fileTooLarge') || 'File size exceeds 100MB limit')
      return
    }

    setError(null)
    setFile(f)
    setFileType(isVideo ? 'video' : 'image')
    setPreview(URL.createObjectURL(f))
  }

  function removeFile() {
    setFile(null)
    setFileType(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError(null)
    
    if (!text.trim() && !file) {
      setError(t('common.emptyPostError') || 'Please write something or add a photo/video')
      return
    }

    setSubmitting(true)
    try {
      await onCreate({ 
        content: text.trim() || null, 
        file, 
        caption: text.trim() || null,
        crop,
        season,
        issueType
      })
      // Reset form
      setText('')
      removeFile()
      setCrop('')
      setSeason('')
      setIssueType('')
    } catch (ex) {
      console.error('Failed to create post', ex)
      setError(ex && ex.message ? ex.message : (t('home.postCreateError') || 'Failed to create post'))
    } finally {
      setSubmitting(false)
    }
  }

  const isExpert = user?.role === 'EXPERT'

  return (
    <form onSubmit={submit} className="new-post-form">
      {/* 1. Text Area */}
      <textarea 
        className="np-textarea"
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder={t('home.whats') || "Share your farming update..."} 
        rows={4} 
        autoFocus={initialType === 'text'}
      />

      {/* 2. Media Preview Area */}
      {preview && (
        <div className="np-preview-container">
          {fileType === 'video' ? (
            <video src={preview} controls className="np-preview-video" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 8 }} />
          ) : (
            <img src={preview} alt="Preview" className="np-preview-image" />
          )}
          <button type="button" className="np-remove-btn" onClick={removeFile}>
            &times;
          </button>
        </div>
      )}

      {/* Expert Fields */}
      {isExpert && (
        <div className="np-expert-fields" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingBottom: '10px' }}>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="np-select">
            <option value="">{t('newPost.selectCrop') || 'Select Crop'}</option>
            <option value="Cotton">{t('crops.cotton') || 'Cotton'}</option>
            <option value="Soybean">{t('crops.soybean') || 'Soybean'}</option>
            <option value="Wheat">{t('crops.wheat') || 'Wheat'}</option>
            <option value="Rice">{t('crops.rice') || 'Rice'}</option>
            <option value="Maize">{t('crops.maize') || 'Maize'}</option>
            <option value="Sugarcane">{t('crops.sugarcane') || 'Sugarcane'}</option>
            <option value="Other">{t('crops.other') || 'Other'}</option>
          </select>

          <select value={season} onChange={(e) => setSeason(e.target.value)} className="np-select">
            <option value="">{t('newPost.selectSeason') || 'Select Season'}</option>
            <option value="Kharif">{t('seasons.kharif') || 'Kharif'}</option>
            <option value="Rabi">{t('seasons.rabi') || 'Rabi'}</option>
            <option value="Summer">{t('seasons.summer') || 'Summer'}</option>
          </select>

          <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="np-select">
            <option value="">{t('newPost.issueType') || 'Issue Type'}</option>
            <option value="Pest">{t('issues.pest') || 'Pest'}</option>
            <option value="Disease">{t('issues.disease') || 'Disease'}</option>
            <option value="Fertilizer">{t('issues.fertilizer') || 'Fertilizer'}</option>
            <option value="Irrigation">{t('issues.irrigation') || 'Irrigation'}</option>
          </select>
        </div>
      )}

      {/* 3. Action Bar */}
      <div className="np-actions">
        {/* Hidden File Input + Styled Label */}
        <input 
          type="file" 
          id="post-file-upload"
          accept="image/*,video/*" 
          onChange={onFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        
        {/* Media Upload Buttons */}
        {!preview && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              type="button" 
              className="np-icon-btn"
              onClick={() => fileInputRef.current?.click()}
              title={t('newPost.addPhotoVideo') || "Add Photo / Video"}
              style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: '#e8f5e9', border: '1px solid #c8e6c9', padding: '6px 12px', borderRadius: 20, color: '#2E7D32', fontWeight: 500 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#2E7D32">
                <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#2E7D32">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              <span style={{ fontSize: '0.9rem' }}>{t('newPost.addMedia') || "Add Media"}</span>
            </button>
          </div>
        )}

        <div className="np-spacer"></div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="np-submit-btn" 
          disabled={submitting || (!text.trim() && !file)}
        >
          {submitting ? (t('common.posting') || 'Posting...') : (t('home.postBtn') || 'Post')}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="np-error">{error}</div>}
    </form>
  )
}