import api from './api'

export async function getPosts() {
  return api.get('/posts')
}

export async function getPostsByAuthor(authorId) {
  return api.get(`/users/${authorId}/posts`)
}

export async function addPost({ content, file, caption }) {
  if (file) {
    const form = new FormData()
    form.append('file', file)
    if (caption) form.append('caption', caption)
    return api.post('/posts', form)
  }
  return api.post('/posts', { content })
}

export async function updatePost(postId, updates) {
  return api.put(`/posts/${postId}`, updates)
}

export async function deletePost(postId) {
  return api.del(`/posts/${postId}`)
}

export async function toggleLike(postId) {
  return api.post(`/posts/${postId}/like`)
}

export async function addComment(postId, text) {
  return api.post(`/posts/${postId}/comment`, { text })
}

export async function deleteComment(postId, commentId) {
  return api.del(`/posts/${postId}/comment/${commentId}`)
}

export default { getPosts, getPostsByAuthor, addPost, updatePost, deletePost, toggleLike, addComment }