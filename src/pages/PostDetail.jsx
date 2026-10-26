import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as postsApi from '../services/posts'
import Post from '../components/Post'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../i18n'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      setError(null)
      try {
        const data = await postsApi.getPosts()
        const found = data.find(p => String(p.id) === String(id))
        if (!found) setError(t('errors.notFound') || 'Post not found')
        setPost(found)
      } catch (e) {
        setError(t('errors.fetchError') || 'Could not load post')
      }
      setLoading(false)
    }
    fetchPost()
  }, [id, t])

  if (loading) return <div>{t('home.loading')}</div>
  if (error) return <div style={{ color: '#d32f2f', textAlign: 'center' }}>{error}</div>
  if (!post) return null

  return (
    <div style={{ maxWidth: 540, margin: '32px auto' }}>
      <Post post={post} currentUser={user} />
    </div>
  )
}
