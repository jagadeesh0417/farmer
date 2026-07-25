const PREFIX = 'haifarmer_demo_'

function load(key) {
  try { return JSON.parse(localStorage.getItem(PREFIX + key) || '[]') } catch { return [] }
}

function save(key, data) {
  localStorage.setItem(PREFIX + key, JSON.stringify(data))
}

export function getItems(key) {
  return load(key)
}

export function addItem(key, item) {
  const items = load(key)
  const id = item._id || 'demo-' + Date.now()
  const entry = { ...item, _id: id }
  items.unshift(entry)
  save(key, items)
  return entry
}

export function updateItem(key, id, updates) {
  const items = load(key)
  const idx = items.findIndex(i => i._id === id)
  if (idx === -1) {
    const entry = { ...updates, _id: id }
    items.unshift(entry)
    save(key, items)
    return entry
  }
  items[idx] = { ...items[idx], ...updates }
  save(key, items)
  return items[idx]
}

export function deleteItem(key, id) {
  const items = load(key).filter(i => i._id !== id)
  save(key, items)
}

export function toggleItem(key, id, field = 'isActive') {
  const items = load(key)
  const idx = items.findIndex(i => i._id === id)
  if (idx === -1) return
  items[idx][field] = !items[idx][field]
  save(key, items)
}
