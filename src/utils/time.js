export function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString()
}

export function timeUntil(dateStr) {
  if (!dateStr) return null
  const diffMs = new Date(dateStr).getTime() - Date.now()
  if (diffMs <= 0) return 'Expired'
  const hours = Math.round(diffMs / 3600000)
  if (hours < 24) return `${hours}h left`
  const days = Math.round(hours / 24)
  return `${days}d left`
}

export function isPast(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr).getTime() < Date.now()
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
