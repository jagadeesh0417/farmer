import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function TaggedProductCard({ product, onView }) {
  const { cartItems, addToCart, updateQuantity, openCartDrawer } = useCart()
  const pid = product._id || product.id
  const variants = product.variants || product.product_variants || []
  const firstVariant = variants[0]
  const variantId = firstVariant?._id || firstVariant?.id || null
  const price = firstVariant?.price ?? product.basePrice ?? product.base_price ?? product.price ?? 0
  const mrp = firstVariant?.original_price ?? firstVariant?.mrp ?? product.mrp ?? product.original_price ?? price
  const discountPct = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0

  const cartItem = cartItems?.find(i => i.product_id === pid && i.variant_id === variantId)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || 1

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart({
      product_id: pid,
      variant_id: variantId,
      quantity: 1,
      product,
      variant: firstVariant || null,
    })
  }

  const changeQty = async (e, qty) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartItem) {
      if (qty < 1) await updateQuantity(cartItem.id, 0)
      else await updateQuantity(cartItem.id, qty)
    }
  }

  return (
    <Link to={`/products/${slugify(product.name)}`} onClick={onView}
      className="relative flex w-[230px] shrink-0 snap-start flex-col rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20"
      aria-label={`View ${product.name}`}>
      <div className="flex items-center gap-2.5">
        <img src={getImageUrl(product.images?.[0] || product.image_url)}
          alt={product.name}
          className="h-14 w-14 shrink-0 rounded-lg bg-white/90 object-contain p-1"
          onError={(e) => { e.target.src = generatePlaceholder('product', product.name) }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">{product.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-bold text-green-400">{formatPrice(price)}</span>
            {mrp > price && <span className="text-[11px] text-white/50 line-through">{formatPrice(mrp)}</span>}
            {discountPct > 0 && (
              <span className="rounded-full bg-green-500 px-1.5 py-px text-[10px] font-bold text-white">{discountPct}% off</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        {isInCart ? (
          <div className="stepper-enter flex h-8 w-full items-center justify-between overflow-hidden rounded-full border border-white/30 bg-white/15">
            <button type="button" onClick={(e) => changeQty(e, cartQuantity - 1)}
              aria-label="Decrease quantity"
              className="flex h-full w-8 items-center justify-center text-sm font-bold text-white transition hover:bg-white/20">−</button>
            <span key={cartQuantity} className="qty-pop min-w-[24px] text-center text-[12px] font-bold text-white">{cartQuantity}</span>
            <button type="button" onClick={(e) => changeQty(e, cartQuantity + 1)}
              aria-label="Increase quantity"
              className="flex h-full w-8 items-center justify-center text-sm font-bold text-white transition hover:bg-white/20">+</button>
          </div>
        ) : (
          <button type="button" onClick={handleAdd}
            className="flex h-8 w-full items-center justify-center gap-1 rounded-full bg-green-600 text-[12px] font-bold text-white transition hover:bg-green-700 active:scale-[0.97]">
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  )
}

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
  const { openCartDrawer } = useCart()
  const [current, setCurrent] = useState(initialIndex)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [ended, setEnded] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const story = stories[current]

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    setEnded(false)
    setBuffering(false)
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [current])

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume
  }, [volume])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const v = videoRef.current
    setCurrentTime(v.currentTime)
    if (v.duration) setDuration(v.duration)
    setProgress((v.currentTime / (v.duration || 1)) * 100)
  }

  const seekTo = (e) => {
    if (!videoRef.current || !videoRef.current.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    videoRef.current.currentTime = ratio * videoRef.current.duration
    setProgress(ratio * 100)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (ended) { videoRef.current.currentTime = 0; setEnded(false) }
    if (videoRef.current.paused) videoRef.current.play().then(() => setPlaying(true)).catch(() => {})
    else videoRef.current.pause()
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else el.requestFullscreen?.().catch(() => {})
  }

  const goNext = () => { if (current < stories.length - 1) setCurrent(c => c + 1) }
  const goPrev = () => { if (current > 0) setCurrent(c => c - 1) }

  if (!story) return null

  const tagged = story.products && Array.isArray(story.products) && story.products.length > 0
    ? story.products
    : (story.taggedProduct || story.productId) && (story.taggedProduct?._id || story.productId?._id || story.taggedProduct?.id || story.productId?.id)
      ? [story.taggedProduct || story.productId]
      : []
  const hasVideo = Boolean(story.src || story.videoUrl)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={onClose} role="dialog" aria-modal="true" aria-label="Video player">
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white" aria-label="Close player">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {stories.length > 1 && (
        <div className="absolute top-4 left-4 z-20 text-white/60 text-xs font-medium bg-white/10 rounded-full px-3 py-1.5">
          {current + 1} / {stories.length}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Video player */}
        <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl flex-shrink-0" style={{ maxHeight: '60vh' }}>
          {hasVideo ? (
            <video ref={videoRef}
              src={story.src || story.videoUrl}
              muted={muted}
              playsInline
              loop={!ended}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
              onPlaying={() => { setPlaying(true); setBuffering(false) }}
              onPause={() => setPlaying(false)}
              onWaiting={() => setBuffering(true)}
              onEnded={() => setEnded(true)}
              onClick={togglePlay}
              className="w-full max-h-[60vh] object-contain"
              poster={story.poster}
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-white/40 text-sm">Unable to load video</div>
          )}

          {/* Buffering spinner */}
          {buffering && hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" aria-label="Buffering" />
            </div>
          )}

          {/* Big play overlay */}
          {!playing && !ended && hasVideo && (
            <button type="button" onClick={togglePlay} aria-label="Play video"
              className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30">
              <svg className="h-7 w-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
          )}

          {/* Replay overlay */}
          {ended && hasVideo && (
            <button type="button" onClick={togglePlay} aria-label="Replay video"
              className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5.07 8.07A8 8 0 1112 20a8 8 0 01-8-8" /></svg>
            </button>
          )}

          {/* Seek bar + controls */}
          {hasVideo && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pt-6 pb-2">
              {/* Seek */}
              <div className="w-full h-3 flex items-center cursor-pointer group"
                onClick={seekTo} role="slider" aria-label="Seek video" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)} tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' && videoRef.current) videoRef.current.currentTime += 5
                  if (e.key === 'ArrowLeft' && videoRef.current) videoRef.current.currentTime -= 5
                }}>
                <div className="w-full h-1 rounded-full bg-white/30 group-hover:h-1.5 transition-all">
                  <div className="h-full rounded-full bg-green-500 relative" style={{ width: `${progress}%` }}>
                    <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Control row */}
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white">
                    {playing ? (
                      <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                    ) : (
                      <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                  <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute' : 'Mute'} className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white">
                    {muted ? (
                      <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                    ) : (
                      <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                    )}
                  </button>
                  <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} aria-label="Volume"
                    onChange={(e) => { const v = Number(e.target.value); setVolume(v); if (v > 0 && muted) setMuted(false); if (v === 0) setMuted(true) }}
                    className="hidden sm:block w-16 accent-green-500 cursor-pointer" />
                  <span className="text-[11px] font-medium text-white/70 tabular-nums">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {stories.length > 1 && (
                    <>
                      <button type="button" onClick={goPrev} disabled={current === 0} aria-label="Previous story"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-30">‹</button>
                      <button type="button" onClick={goNext} disabled={current >= stories.length - 1} aria-label="Next story"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-30">›</button>
                    </>
                  )}
                  <button type="button" onClick={toggleFullscreen} aria-label="Toggle fullscreen"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white">
                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tagged products — glassmorphism strip */}
        {tagged.length > 0 && (
          <div className="w-full mt-3 flex-shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 mb-2">Shop the video</p>
            <div className="hide-scrollbar flex gap-2.5 overflow-x-auto carousel-snap pb-1 -mx-1 px-1">
              {tagged.map(p => <TaggedProductCard key={p._id || p.id} product={p} onView={onClose} />)}
            </div>
          </div>
        )}

        {/* Story info */}
        <div className="w-full mt-3 text-center flex-shrink-0">
          <h3 className="text-white text-lg font-bold">{story.alt || story.title || 'Story'}</h3>
          {story.description && <p className="text-white/50 text-sm mt-1">{story.description}</p>}
        </div>
      </div>
    </div>
  )
}
