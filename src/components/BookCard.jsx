import React from 'react'
import { formatDate, isPast } from '../utils/time'

const STATUS_STYLES = {
  available: 'bg-[#e8ddd0] text-[#1a1008]',
  lent: 'bg-[#f9e3b3] text-[#8a5200]',
  borrowed: 'bg-[#dbeafe] text-[#1d4ed8]',
  swap: 'bg-[#d1fae5] text-[#047857]',
}

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f5ede0"/%3E%3Cstop offset="100%25" stop-color="%23e2ddd4"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="560" rx="28" fill="url(%23g)"/%3E%3Cpath d="M132 150h136a20 20 0 0 1 20 20v220a20 20 0 0 1-20 20H132a20 20 0 0 1-20-20V170a20 20 0 0 1 20-20Z" fill="%23ffffff" fill-opacity="0.56"/%3E%3Cpath d="M155 198h90M155 232h110M155 266h74" stroke="%238B3A0F" stroke-width="14" stroke-linecap="round"/%3E%3Ccircle cx="275" cy="355" r="18" fill="%238B3A0F" fill-opacity="0.15"/%3E%3C/svg%3E'

export default function BookCard({ book, onBorrow, onSwap, onEdit, onDelete, onReturn, dueDate }) {
  const status = (book.status || 'available').toLowerCase()
  const statusLabel = {
    available: 'Available',
    lent: 'Lent out',
    borrowed: 'Borrowed',
    swap: 'Swap offer',
  }[status] || 'Available'

  const overdue = dueDate && isPast(dueDate)

  return (
    <div className="group overflow-hidden rounded-2xl border border-[#e2ddd4] bg-white shadow-[0_8px_20px_rgba(139,58,15,0.05)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(139,58,15,0.08)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5ede0]">
        <img
          src={book.imageUrl || book.image || FALLBACK_IMAGE}
          alt={`Cover of ${book.title}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1810]/55 via-transparent to-transparent" />
        <span className={`absolute left-4 top-4 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.available}`}>
          {statusLabel}
        </span>
        {dueDate && (
          <span className={`absolute right-4 top-4 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${overdue ? 'bg-red-100 text-red-700' : 'bg-white/90 text-[#6b5744]'}`}>
            {overdue ? 'Overdue' : `Due ${formatDate(dueDate)}`}
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="min-h-[64px]">
          <h3 className="text-sm font-semibold text-[#1e1810] line-clamp-2">{book.title}</h3>
          <p className="mt-1 text-xs text-[#6b5744]">{book.author}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#9d7c5e]">{book.genre || book.category || 'General'}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e2ddd4] text-[#6b5744] transition-colors hover:bg-[#f5ede0] hover:text-[#8B3A0F] text-sm"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(book.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e2ddd4] text-[#6b5744] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-sm"
                title="Delete"
              >
                🗑
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {onReturn && (
              <button type="button" onClick={() => onReturn(book)} className="rounded-full border border-[#d8c5b3] px-3 py-1 text-sm font-medium text-[#6b5744] transition-colors hover:bg-[#f5ede0]">Mark returned</button>
            )}
            {onSwap && (
              <button type="button" onClick={() => onSwap(book)} className="rounded-full border border-primary px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-[#f3e4d5]">Swap</button>
            )}
            {onBorrow && (
              <button type="button" onClick={() => onBorrow(book.id)} className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-[#7a3010]">Borrow</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
