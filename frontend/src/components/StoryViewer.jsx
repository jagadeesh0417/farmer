import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, getImageUrl } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef(null)
  const story = stories[current]

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [current])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setProgress((videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100)
  }

  const goNext = () => { if (current < stories.length - 1) setCurrent(c => c + 1) }
  const goPrev = () => { if (current > 0) setCurrent(c => c - 1) }

  if (!story) return null

  const product = story.taggedProduct || null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={onClose}>
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/80 hover:text-white" aria-label="Close">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Story counter */}
      {stories.length > 1 && (
        <div className="absolute top-4 left-4 z-10 text-white/60 text-xs font-medium">
          {current + 1} / {stories.length}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full" onClick={e => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Video container */}
        <div className="w-full max-h-[65vh] rounded-xl overflow-hidden bg-black relative">
          <video ref={videoRef}
            src={story.src || story.videoUrl}
            muted={muted}
            playsInline
            loop
            onTimeUpdate={handleTimeUpdate}
            onEnded={goNext}
            className="w-full h-full max-h-[65vh] object-contain"
            onClick={(e) => { e.stopPropagation(); if (videoRef.current) { videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause() } }}
          />

          {/* Play/Pause overlay */}
          <button onClick={(e) => { e.stopPropagation(); if (videoRef.current) { videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause() } }}
            className="absolute bottom-3 left-3 text-white/70 hover:text-white">
            {playing ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          {/* Mute/Unmute */}
          <button onClick={(e) => { e.stopPropagation(); setMuted(!muted) }}
            className="absolute bottom-3 right-3 text-white/70 hover:text-white">
            {muted ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
            )}
          </button>
        </div>

        {/* Navigation arrows */}
        {stories.length > 1 && (
          <div className="flex items-center justify-between w-full mt-3">
            <button onClick={(e) => { e.stopPropagation(); goPrev() }} disabled={current === 0}
              className="text-white/50 hover:text-white disabled:opacity-30 text-sm font-semibold">← Previous</button>
            <button onClick={(e) => { e.stopPropagation(); goNext() }} disabled={current >= stories.length - 1}
              className="text-white/50 hover:text-white disabled:opacity-30 text-sm font-semibold">Next →</button>
          </div>
        )}

        {/* Story description */}
        <div className="w-full mt-4 text-center">
          <h3 className="text-white text-lg font-bold">{story.alt || story.title}</h3>
          {story.duration && <p className="text-white/50 text-xs mt-0.5">{story.duration}</p>}
        </div>

        {/* Tagged product card */}
        {product && (
          <Link to={`/products/${slugify(product.name)}`} onClick={onClose}
            className="mt-4 w-full flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-3 hover:bg-white/20 transition">
            <img src={getImageUrl(product.image_url || product.images?.[0])} alt={product.name}
              className="h-14 w-14 rounded-lg object-cover bg-[#F0E6D3] shrink-0"
              onError={(e) => { e.target.src = generatePlaceholder('product', product.name) }} />
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold text-sm truncate">{product.name}</p>
              <p className="text-green-400 font-bold text-sm">{formatPrice(product.base_price || product.price || 0)}</p>
              {product.description && <p className="text-white/50 text-xs truncate mt-0.5">{product.description}</p>}
            </div>
            <span className="text-white/70 text-xs font-semibold shrink-0 hover:text-white">View →</span>
          </Link>
        )}
      </div>
    </div>
  )
}
