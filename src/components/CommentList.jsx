import { useState } from 'react'
import { useTranslation } from '../i18n'

export default function CommentList({ comments = [], onAdd, currentUser, postAuthorId, onDelete }) {
  const [text, setText] = useState('')
  const { t, lang } = useTranslation()

  function submit(e) {
    e.preventDefault()
    const val = text.trim()
    if (!val) return
    onAdd(val)
    setText('')
  }
  return (
    <div className="comments">
      <div className="comments-list">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <strong>{c.authorName}</strong>: {c.text}
            {(currentUser && (currentUser.id === postAuthorId || currentUser.name === c.authorName)) && (
              <button className="comment-delete" onClick={() => onDelete && onDelete(c.id)} title={t('post.deleteComment') || "Delete comment"}>×</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="comment-form">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('post.reply')} />
        <button type="submit">{t('post.reply')}</button>
      </form>
    </div>
  )
}
