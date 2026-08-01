import React, { useEffect, useRef, useState } from 'react'
import openLibraryService from '../services/openLibraryService'

export default function BookLookup({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [pickingKey, setPickingKey] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const found = await openLibraryService.searchBooks(query)
        setResults(found)
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const pick = async (result) => {
    setPickingKey(result.key)
    try {
      const description = await openLibraryService.getWorkDescription(result.key)
      onSelect({
        title: result.title,
        author: result.author,
        genre: result.genre,
        imageUrl: result.coverUrlLarge || '',
        description,
      })
    } finally {
      setPickingKey(null)
      setQuery('')
      setResults([])
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[#e2ddd4] bg-[#f5ede0] text-[#1e1810] text-sm focus:outline-none focus:border-[#8B3A0F]"

  return (
    <div className="relative">
      <label className="block text-xs text-[#6b5744] mb-1">Look up a book (optional)</label>
      <input
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title to auto-fill everything below"
      />
      <p className="mt-1 text-[11px] text-[#9d7c5e]">Powered by Open Library — pick a result to fill in author, genre, cover and summary.</p>

      {(searching || results.length > 0) && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[#e2ddd4] bg-white shadow-lg max-h-72 overflow-y-auto">
          {searching && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-[#9d7c5e]">Searching…</p>
          )}
          {results.map((r) => (
            <button
              key={r.key}
              type="button"
              disabled={pickingKey === r.key}
              onClick={() => pick(r)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#f5ede0] disabled:opacity-60"
            >
              {r.coverUrl ? (
                <img src={r.coverUrl} alt="" className="h-12 w-9 flex-shrink-0 rounded object-cover" />
              ) : (
                <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center rounded bg-[#f5ede0] text-[10px] text-[#9d7c5e]">—</div>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#1e1810]">{r.title}</span>
                <span className="block truncate text-xs text-[#6b5744]">
                  {r.author || 'Unknown author'}{r.year ? ` · ${r.year}` : ''}
                </span>
              </span>
              {pickingKey === r.key && <span className="ml-auto flex-shrink-0 text-xs text-[#9d7c5e]">Loading…</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
