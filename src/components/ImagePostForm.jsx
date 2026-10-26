import { useState } from 'react'
import { useTranslation } from '../i18n'

export default function ImagePostForm({ onCreate }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const { t, lang } = useTranslation()

  const [fileType, setFileType] = useState(null)

  function onFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    const isImage = f.type.startsWith('image/')
    const isVideo = f.type.startsWith('video/')
    if (!isImage && !isVideo) {
      alert(t('common.invalidFileType') || 'Only images and videos are allowed')
      return
    }
    setFile(f)
    setFileType(isVideo ? 'video' : 'image')
    setPreview(URL.createObjectURL(f))
  }

  async function submit(e) {
    e.preventDefault()
    if (!file) {
      alert(t('newPost.selectImage') || 'Please select an image or video')
      return
    }
    await onCreate(file, caption)
    setFile(null)
    setFileType(null)
    setPreview(null)
    setCaption('')
  }

  return (
    <form onSubmit={submit} className="image-post-form">
      <div>
        <input type="file" accept="image/*,video/*" onChange={onFileChange} />
      </div>
      {preview && (
        <div style={{ marginTop: 8 }}>
          {fileType === 'video' ? (
            <video src={preview} controls style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
          ) : (
            <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
          )}
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t('home.whats')} />
      </div>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <button type="submit">{t('home.postBtn')}</button>
      </div>
    </form>
  )
}