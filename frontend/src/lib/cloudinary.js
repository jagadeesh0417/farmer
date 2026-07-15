export function cld(url, transform = 'f_auto,q_auto,w_1600,c_limit') {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${transform}/`)
}
