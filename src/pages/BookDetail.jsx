import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import bookService from '../services/bookService'
import requestService from '../services/requestService'
import wikipediaService from '../services/wikipediaService'
import ratingService from '../services/ratingService'
import SwapModal from '../components/SwapModal'
import Button from '../components/Button'
import RatingStars from '../components/RatingStars'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

const STATUS_STYLES = {
  AVAILABLE: 'bg-[#e8ddd0] text-[#1a1008]',
  LENT: 'bg-[#f9e3b3] text-[#8a5200]',
  BORROWED: 'bg-[#dbeafe] text-[#1d4ed8]',
  SWAP: 'bg-[#d1fae5] text-[#047857]',
}
const STATUS_LABELS = {
  AVAILABLE: 'Available',
  LENT: 'Lent out',
  BORROWED: 'Borrowed',
  SWAP: 'Swap offer',
}

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f5ede0"/%3E%3Cstop offset="100%25" stop-color="%23e2ddd4"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="560" rx="28" fill="url(%23g)"/%3E%3Cpath d="M132 150h136a20 20 0 0 1 20 20v220a20 20 0 0 1-20 20H132a20 20 0 0 1-20-20V170a20 20 0 0 1 20-20Z" fill="%23ffffff" fill-opacity="0.56"/%3E%3Cpath d="M155 198h90M155 232h110M155 266h74" stroke="%238B3A0F" stroke-width="14" stroke-linecap="round"/%3E%3Ccircle cx="275" cy="355" r="18" fill="%238B3A0F" fill-opacity="0.15"/%3E%3C/svg%3E'

function WikiSection({ status, summary }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
        <span className="text-sm font-semibold text-[#1e1810]">About this book</span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-[#9d7c5e]">via Wikipedia</span>
      </div>

      {status === 'loading' && (
        <div className="p-5 space-y-2 animate-pulse">
          <div className="h-3 w-full rounded bg-[#f0e8db]" />
          <div className="h-3 w-11/12 rounded bg-[#f0e8db]" />
          <div className="h-3 w-3/4 rounded bg-[#f0e8db]" />
        </div>
      )}

      {status === 'empty' && (
        <div className="p-5 text-sm text-[#6b5744]">
          We couldn't find a matching Wikipedia article for this book yet.
        </div>
      )}

      {status === 'error' && (
        <div className="p-5 text-sm text-[#6b5744]">
          Couldn't reach Wikipedia right now. Try again in a bit.
        </div>
      )}

      {status === 'ready' && summary && (
        <div className="p-5 flex gap-5">
          {summary.thumbnail && (
            <img
              src={summary.thumbnail}
              alt={summary.title}
              className="hidden sm:block h-28 w-28 flex-shrink-0 rounded-lg object-cover border border-[#e2ddd4]"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-[#3a2e22]">{summary.extract}</p>
            <a
              href={summary.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8B3A0F] hover:underline"
            >
              Read more on Wikipedia →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function RatingSection({ average, count, myRating, rateValue, rateComment, rateBusy, rateError, rateNotice, onRateChange, onCommentChange, onSubmit }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
        <span className="text-sm font-semibold text-[#1e1810]">Ratings</span>
        <RatingStars value={average || 0} count={count} readOnly />
      </div>

      <div className="p-5 space-y-3">
        <p className="text-xs text-[#9d7c5e]">{myRating ? 'Update your rating' : 'Rate this book'}</p>
        <RatingStars value={rateValue} onChange={onRateChange} />
        <textarea
          value={rateComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add an optional comment…"
          rows={3}
          className="w-full rounded-lg border border-[#e2ddd4] px-3 py-2 text-sm text-[#3a2e22] focus:outline-none focus:ring-2 focus:ring-[#8B3A0F]/20"
        />
        {rateError && <p className="text-sm text-red-600">{rateError}</p>}
        {rateNotice && <p className="text-sm text-emerald-700">{rateNotice}</p>}
        <Button variant="primary" onClick={onSubmit} disabled={rateBusy || !rateValue}>
          {rateBusy ? 'Publishing…' : myRating ? 'Update rating' : 'Publish rating'}
        </Button>
      </div>
    </div>
  )
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [book, setBook] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)

  const [wikiStatus, setWikiStatus] = useState('loading')
  const [wikiSummary, setWikiSummary] = useState(null)

  const [myBooks, setMyBooks] = useState([])
  const [swapOpen, setSwapOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const [ratingsData, setRatingsData] = useState({ average: null, count: 0, myRating: null })
  const [rateValue, setRateValue] = useState(0)
  const [rateComment, setRateComment] = useState('')
  const [rateBusy, setRateBusy] = useState(false)
  const [rateError, setRateError] = useState('')
  const [rateNotice, setRateNotice] = useState('')

  const loadBook = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await bookService.getById(id, token)
      setBook(data)
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load this book.'))
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => { loadBook() }, [loadBook])

  useEffect(() => {
    if (!book) return
    let cancelled = false
    setWikiStatus('loading')
    wikipediaService.getBookSummary(book.title, book.author)
      .then((summary) => {
        if (cancelled) return
        if (summary) {
          setWikiSummary(summary)
          setWikiStatus('ready')
        } else {
          setWikiStatus('empty')
        }
      })
      .catch(() => { if (!cancelled) setWikiStatus('error') })
    return () => { cancelled = true }
  }, [book])

  useEffect(() => {
    if (!user || !token) return
    bookService.getAll(token)
      .then((all) => setMyBooks(all.filter(b => b.status === 'AVAILABLE' && b.ownerId === user.id)))
      .catch(() => {})
  }, [user, token])

  useEffect(() => {
    if (!book || !token) return
    ratingService.getForBook(book.id, token)
      .then((data) => {
        setRatingsData(data)
        if (data.myRating) {
          setRateValue(data.myRating.value)
          setRateComment(data.myRating.comment || '')
        }
      })
      .catch(() => {})
  }, [book, token])

  const handleRateSubmit = async () => {
    setRateBusy(true)
    setRateError('')
    setRateNotice('')
    try {
      const data = await ratingService.rate(book.id, { value: rateValue, comment: rateComment }, token)
      setRatingsData(data)
      setRateNotice('Rating published.')
    } catch (err) {
      setRateError(errorMessage(err, 'Failed to publish rating.'))
    } finally {
      setRateBusy(false)
    }
  }

  const handleBorrow = async () => {
    setBusy(true)
    setActionError('')
    setNotice('')
    try {
      await requestService.create({ bookId: book.id }, token)
      setNotice('Borrow request sent.')
    } catch (err) {
      setActionError(errorMessage(err, 'Failed to send borrow request.'))
    } finally {
      setBusy(false)
    }
  }

  const handleSwapSubmit = async ({ offeredBookId, swapMode }) => {
    await requestService.create({ bookId: book.id, type: 'SWAP', offeredBookId, swapMode }, token)
    setSwapOpen(false)
    setNotice('Swap offer sent.')
  }

  if (loading) {
    return (
      <div className="p-7" style={{ background: '#e1dac9', minHeight: '100%' }}>
        <div className="animate-pulse grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="aspect-[3/4] rounded-2xl bg-[#f0e8db]" />
          <div className="space-y-3">
            <div className="h-6 w-2/3 rounded bg-[#f0e8db]" />
            <div className="h-4 w-1/3 rounded bg-[#f0e8db]" />
            <div className="h-24 w-full rounded bg-[#f0e8db]" />
          </div>
        </div>
      </div>
    )
  }

  if (loadError || !book) {
    return (
      <div className="p-7" style={{ background: '#e1dac9', minHeight: '100%' }}>
        <button onClick={() => navigate(-1)} className="mb-4 text-sm font-medium text-[#8B3A0F] hover:underline">← Back</button>
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          {loadError || 'Book not found.'}
        </div>
      </div>
    )
  }

  const status = (book.status || 'AVAILABLE').toUpperCase()
  const isOwner = book.ownerId === user?.id
  const ownerName = book.owner ? `${book.owner.firstName} ${book.owner.lastName}` : null

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-[#8B3A0F] hover:underline">
        ← Back
      </button>

      {actionError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{actionError}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 border border-emerald-100">{notice}</p>}

      <div className="grid gap-6 md:grid-cols-[280px_1fr] items-start">
        <div className="md:sticky md:top-7">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-[#e2ddd4] bg-[#f5ede0] shadow-[0_8px_24px_rgba(139,58,15,0.1)]">
            <img
              src={book.imageUrl || book.image || FALLBACK_IMAGE}
              alt={`Cover of ${book.title}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#e2ddd4] p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.AVAILABLE}`}>
                {STATUS_LABELS[status] || 'Available'}
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-[#9d7c5e]">{book.category || book.genre || 'General'}</span>
            </div>

            <h1 className="text-2xl font-bold text-[#1e1810] font-serif">{book.title}</h1>
            <p className="mt-1 text-sm text-[#6b5744]">by {book.author}</p>
            {ownerName && (
              <p className="mt-3 text-xs text-[#9d7c5e]">
                Owned by <span className="font-medium text-[#6b5744]">{isOwner ? 'you' : ownerName}</span>
              </p>
            )}

            {book.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#3a2e22] whitespace-pre-line">{book.description}</p>
            )}

            {!isOwner && (
              <div className="mt-5 flex gap-2">
                {status === 'AVAILABLE' && (
                  <Button variant="primary" onClick={handleBorrow} disabled={busy}>
                    {busy ? 'Sending…' : 'Borrow'}
                  </Button>
                )}
                {status === 'AVAILABLE' && (
                  <Button variant="outline" onClick={() => setSwapOpen(true)} disabled={busy}>
                    Propose a swap
                  </Button>
                )}
                {status !== 'AVAILABLE' && (
                  <p className="text-sm text-[#9d7c5e]">This book isn't available right now.</p>
                )}
              </div>
            )}
            {isOwner && (
              <p className="mt-5 text-sm text-[#9d7c5e]">
                This is your book. Manage it from <Link to="/app" className="text-[#8B3A0F] hover:underline">My library</Link>.
              </p>
            )}
          </div>

          <RatingSection
            average={ratingsData.average}
            count={ratingsData.count}
            myRating={ratingsData.myRating}
            rateValue={rateValue}
            rateComment={rateComment}
            rateBusy={rateBusy}
            rateError={rateError}
            rateNotice={rateNotice}
            onRateChange={setRateValue}
            onCommentChange={setRateComment}
            onSubmit={handleRateSubmit}
          />

          <WikiSection status={wikiStatus} summary={wikiSummary} />
        </div>
      </div>

      {swapOpen && (
        <SwapModal
          book={book}
          myBooks={myBooks}
          onClose={() => setSwapOpen(false)}
          onSubmit={handleSwapSubmit}
        />
      )}
    </div>
  )
}
