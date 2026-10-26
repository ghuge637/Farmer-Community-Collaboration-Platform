const STORAGE_KEY = 'social_posts_v1'

function id() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now() { return new Date().toISOString() }

function seed() {
  return [
    {
      id: id(),
      authorId: 'user-2',
      authorName: 'Alice',
      content: 'Hello world! This is my first post 🚀',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      likes: ['user-3'],
      comments: [
        { id: id(), authorId: 'user-3', authorName: 'Bob', text: 'Nice post!', createdAt: now() },
      ],
    },
    {
      id: id(),
      authorId: 'user-3',
      authorName: 'Bob',
      content: 'Loving this demo social feed 💬',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      likes: [],
      comments: [],
    },
  ]
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const s = seed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
      return s
    }
    return JSON.parse(raw)
  } catch (err) {
    const s = seed()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    return s
  }
}

function save(posts) { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)) }

export async function getPosts() {
  const posts = load()
  // newest first
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getPostsByAuthor(authorId) {
  const posts = load()
  return posts.filter((p) => p.authorId === authorId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function addPost({ authorId, authorName, content }) {
  const posts = load()
  const p = { id: id(), authorId, authorName, content, createdAt: now(), likes: [], comments: [] }
  posts.push(p)
  save(posts)
  return p
}

export async function updatePost(postId, updates) {
  const posts = load()
  const i = posts.findIndex((p) => p.id === postId)
  if (i === -1) throw new Error('Post not found')
  posts[i] = { ...posts[i], ...updates }
  save(posts)
  return posts[i]
}

export async function deletePost(postId) {
  let posts = load()
  posts = posts.filter((p) => p.id !== postId)
  save(posts)
  return true
}

export async function toggleLike(postId, userId) {
  const posts = load()
  const p = posts.find((p) => p.id === postId)
  if (!p) throw new Error('Post not found')
  const idx = p.likes.indexOf(userId)
  if (idx === -1) p.likes.push(userId)
  else p.likes.splice(idx, 1)
  save(posts)
  return p
}

export async function addComment(postId, { authorId, authorName, text }) {
  const posts = load()
  const p = posts.find((p) => p.id === postId)
  if (!p) throw new Error('Post not found')
  const c = { id: id(), authorId, authorName, text, createdAt: now() }
  p.comments.push(c)
  save(posts)
  return c
}
