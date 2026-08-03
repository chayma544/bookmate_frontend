import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import BookCard from '../components/BookCard'
import bookService from '../services/bookService'
import requestService from '../services/requestService'
import { timeAgo } from '../utils/time'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function fromBackend(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.category,
    status: book.status === 'BORROWED' ? 'borrowed' : 'available',
    imageUrl: book.image || '',
    description: book.description || '',
  }
}

function findActiveRequestForBook(requests, bookId) {
  return requests.find(r => r.status === 'APPROVED' && !r.returnedAt && (r.bookId === bookId || r.offeredBookId === bookId))
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, token, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks]   = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadAll = useCallback(async () => {
    try {
      const [allBooks, allRequests] = await Promise.all([
        bookService.getAll(token),
        requestService.getAll(token),
      ])
      setBooks(allBooks.filter(b => b.ownerId === user.id).map(fromBackend))
      setRequests(allRequests)
      setLoadError('')
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load your dashboard.'))
    }
  }, [token, user])

  useEffect(() => { if (user) loadAll() }, [user, loadAll])

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  )

  const delBook = async (id) => {
    await bookService.delete(id, token)
    await loadAll()
  }

  const act = async (fn, id) => {
    setBusyId(id)
    setActionError('')
    try {
      await fn()
      await loadAll()
    } catch (err) {
      setActionError(errorMessage(err, 'Action failed.'))
    } finally {
      setBusyId(null)
    }
  }

  const acceptRequest = (req) => act(() => requestService.update(req.id, { status: 'APPROVED' }, token), req.id)
  const declineRequest = (req) => act(() => requestService.update(req.id, { status: 'REJECTED' }, token), req.id)
  const returnBook = (req) => act(() => requestService.returnBook(req.id, token), req.id)

  const incomingPending = requests
    .filter(r => r.book.ownerId === user?.id && r.status === 'PENDING')
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))

  return (
      <div className="p-7" style={{ background: '#e1dac9', minHeight: '100%' }}>

        {/* top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1e1810]">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}</h1>
            {loadError && <p className="text-sm text-red-600 mt-0.5">{loadError}</p>}
          </div>
          <div className="flex gap-3 items-center">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search books or authors…"
              className="px-4 py-2 rounded-full border border-[#e2ddd4] bg-white text-sm text-[#1e1810] focus:outline-none focus:border-[#8B3A0F] w-52"
            />
            <Link to="/app/books/new">
              <Button variant="primary">+ Add book</Button>
            </Link>
          </div>
        </div>

        {/* about you */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#f5ede0] px-3 py-1 text-xs font-semibold text-primary">
            {isAdmin ? 'Admin' : 'Member'}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            (user?.reportCount || 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {(user?.reportCount || 0) > 0 ? `⚠ Reported ${user.reportCount} time${user.reportCount !== 1 ? 's' : ''}` : '✓ No reports'}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#f5ede0] px-3 py-1 text-xs font-semibold text-primary">
            {incomingPending.length} pending request{incomingPending.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* books cards */}
        <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
            <span className="text-sm font-semibold text-[#1e1810]">My library</span>
            <span className="text-xs text-[#6b5744]">{filtered.length} book{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6b5744]">No books found.</div>
          ) : (
            <div className="p-4">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((book) => {
                  const activeReq = book.status === 'borrowed' ? findActiveRequestForBook(requests, book.id) : null
                  return (
                    <BookCard
                      key={book.id}
                      book={book}
                      dueDate={activeReq?.dueDate}
                      onEdit={(selectedBook) => navigate(`/app/books/${selectedBook.id}/edit`)}
                      onDelete={delBook}
                      onReturn={activeReq ? () => returnBook(activeReq) : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* bottom grid */}
        <div className="grid grid-cols-2 gap-5">
          {/* recent activity */}
          <div className="bg-white rounded-xl border border-[#e2ddd4] p-5">
            <h2 className="text-sm font-semibold text-[#1e1810] mb-4">Recent activity</h2>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-sm text-[#6b5744]">No activity yet.</p>
              ) : (
                [...requests]
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .slice(0, 4)
                  .map((r) => (
                    <div key={r.id} className="flex gap-3 pb-3 border-b border-[#e2ddd4] last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{
                        background: r.status === 'APPROVED' ? '#059669' : r.status === 'REJECTED' ? '#d97706' : r.status === 'EXPIRED' ? '#9d7c5e' : '#8B3A0F',
                      }} />
                      <div>
                        <p className="text-sm text-[#1e1810] leading-snug">
                          {r.book.ownerId === user?.id
                            ? `${r.borrower.firstName} ${r.status === 'PENDING' ? 'wants to' : r.status === 'APPROVED' ? (r.type === 'SWAP' ? 'swapped for' : 'borrowed') : r.status.toLowerCase()} `
                            : `You ${r.status === 'PENDING' ? 'requested' : r.status === 'APPROVED' ? (r.type === 'SWAP' ? 'swapped for' : 'borrowed') : r.status.toLowerCase() + ' your request for'} `}
                          <em>{r.book.title}</em>
                        </p>
                        <p className="text-xs text-[#6b5744] mt-0.5">{timeAgo(r.updatedAt)}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* borrow requests */}
          <div className="bg-white rounded-xl border border-[#e2ddd4] p-5">
            <h2 className="text-sm font-semibold text-[#1e1810] mb-4">Borrow requests</h2>
            {actionError && <p className="mb-3 text-xs text-red-600">{actionError}</p>}
            <div className="space-y-3">
              {incomingPending.length === 0 ? (
                <p className="text-sm text-[#6b5744]">No pending requests.</p>
              ) : (
                incomingPending.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 pb-3 border-b border-[#e2ddd4] last:border-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: '#f5ede0', color: '#8B3A0F' }}>{r.borrower.firstName[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1e1810]">{r.borrower.firstName} {r.borrower.lastName}</p>
                      <p className="text-xs text-[#6b5744] truncate">
                        wants <em>{r.book.title}</em>{r.type === 'SWAP' && r.offeredBook ? ` (swap: "${r.offeredBook.title}")` : ''} · {timeAgo(r.requestDate)}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        disabled={busyId === r.id}
                        onClick={() => acceptRequest(r)}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#8B3A0F] text-white hover:bg-[#7a3010] transition-colors disabled:opacity-60"
                      >Accept</button>
                      <button
                        disabled={busyId === r.id}
                        onClick={() => declineRequest(r)}
                        className="px-3 py-1 rounded-full text-xs border border-[#e2ddd4] text-[#6b5744] hover:bg-[#f5ede0] transition-colors disabled:opacity-60"
                      >Decline</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
