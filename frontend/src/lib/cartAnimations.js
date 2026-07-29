let animId = 0

export function flyToCart(sourceEl, imageUrl, cartSelector = '[aria-label="Cart"]') {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  const cartEl = document.querySelector(cartSelector)
  if (!cartEl || !sourceEl) return

  const sourceRect = sourceEl.getBoundingClientRect()
  const cartRect = cartEl.getBoundingClientRect()

  const clone = document.createElement('div')
  clone.id = `fly-clone-${++animId}`
  clone.style.cssText = `
    position: fixed;
    z-index: 99999;
    pointer-events: none;
    width: ${sourceRect.width}px;
    height: ${sourceRect.height}px;
    left: ${sourceRect.left}px;
    top: ${sourceRect.top}px;
    border-radius: 8px;
    overflow: hidden;
  `

  const img = document.createElement('img')
  img.src = imageUrl
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
  clone.appendChild(img)
  document.body.appendChild(clone)

  const startX = sourceRect.left
  const startY = sourceRect.top
  const endX = cartRect.left + cartRect.width / 2 - sourceRect.width / 2
  const endY = cartRect.top + cartRect.height / 2 - sourceRect.height / 2

  const startTime = performance.now()
  const duration = 650

  function animate(time) {
    const elapsed = time - startTime
    const t = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    const x = startX + (endX - startX) * ease
    const y = startY + (endY - startY) * ease
    const scale = 1 - ease * 0.5
    const opacity = 1 - ease * 0.3

    clone.style.transform = `translate(${x - startX}px, ${y - startY}px) scale(${scale})`
    clone.style.opacity = opacity
    clone.style.left = `${startX}px`
    clone.style.top = `${startY}px`

    if (t < 1) {
      requestAnimationFrame(animate)
    } else {
      clone.remove()
      triggerCartBounce(cartEl)
    }
  }
  requestAnimationFrame(animate)
}

function triggerCartBounce(cartEl) {
  cartEl.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  cartEl.style.transform = 'scale(1.2)'
  setTimeout(() => {
    cartEl.style.transform = 'scale(1)'
    setTimeout(() => { cartEl.style.transition = '' }, 300)
  }, 150)
}

export function triggerBadgePop(badgeEl) {
  if (!badgeEl) return
  badgeEl.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
  badgeEl.style.transform = 'scale(1.3)'
  setTimeout(() => {
    badgeEl.style.transform = 'scale(1)'
    setTimeout(() => { badgeEl.style.transition = '' }, 350)
  }, 175)
}
