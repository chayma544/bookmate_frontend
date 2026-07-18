const SEARCH_URL = 'https://en.wikipedia.org/w/api.php'
const SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary'

async function findPageTitle(query) {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '1',
    format: 'json',
    origin: '*',
  })
  const res = await fetch(`${SEARCH_URL}?${params.toString()}`)
  if (!res.ok) return null
  const data = await res.json()
  return data?.query?.search?.[0]?.title || null
}

async function fetchSummary(pageTitle) {
  const res = await fetch(`${SUMMARY_URL}/${encodeURIComponent(pageTitle)}`)
  if (!res.ok) return null
  const data = await res.json()
  if (!data?.extract) return null
  return {
    title: data.title,
    extract: data.extract,
    thumbnail: data.thumbnail?.source || null,
    pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
  }
}

// Looks up a book on Wikipedia by title/author, trying a couple of query
// shapes since book pages are indexed under all sorts of titles
// (e.g. "The Alchemist (novel)").
export async function getBookSummary(title, author) {
  const queries = [
    `${title} ${author} book`,
    `${title} novel`,
    title,
  ]

  for (const query of queries) {
    try {
      const pageTitle = await findPageTitle(query)
      if (!pageTitle) continue
      const summary = await fetchSummary(pageTitle)
      if (summary) return summary
    } catch {
      // try the next query shape
    }
  }
  return null
}

export default { getBookSummary }
