const SEARCH_URL = 'https://openlibrary.org/search.json'

function toTitleCase(s) {
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
}

export async function searchBooks(query, limit = 5) {
  if (!query || query.trim().length < 2) return []
  const params = new URLSearchParams({
    q: query.trim(),
    limit: String(limit),
    fields: 'key,title,author_name,first_publish_year,cover_i,subject',
  })
  const res = await fetch(`${SEARCH_URL}?${params.toString()}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((d) => ({
    key: d.key,
    title: d.title,
    author: d.author_name?.[0] || '',
    year: d.first_publish_year || null,
    genre: d.subject?.[0] ? toTitleCase(d.subject[0]) : '',
    coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    coverUrlLarge: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
  }))
}

export async function getWorkDescription(workKey) {
  if (!workKey) return ''
  try {
    const res = await fetch(`https://openlibrary.org${workKey}.json`)
    if (!res.ok) return ''
    const data = await res.json()
    if (!data.description) return ''
    return typeof data.description === 'string' ? data.description : data.description.value || ''
  } catch {
    return ''
  }
}

export default { searchBooks, getWorkDescription }
