export default function LikeButton({ liked, count, onToggle }) {
  return (
    <button className="like-btn" onClick={onToggle}>
      {liked ? '❤️' : '🤍'} {count}
    </button>
  )
}
