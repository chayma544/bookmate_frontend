import React, { useEffect, useState, useCallback } from 'react'
import BookCard from '../components/BookCard'
import Modal from '../components/Modal'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import bookService from '../services/bookService'
import requestService from '../services/requestService'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function SwapModal({ book, myBooks, onClose, onSubmit }) {
  const [offeredBookId, setOfferedBookId] = useState(myBooks[0]?.id || '')
  const [swapMode, setSwapMode] = useState('TEMPORARY')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!offeredBookId) return
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({ offeredBookId, swapMode })
    } catch (err) {
      setError(errorMessage(err, 'Failed to send swap offer.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={`Propose a swap for "${book.title}"`}>
      {myBooks.length === 0 ? (
        <p className="text-sm text-[#6b5744]">You don't have any available books to offer. Add one from your Dashboard first.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8a7260]">Offer one of your books</label>
            <select
              value={offeredBookId}
              onChange={(e) => setOfferedBookId(e.target.value)}
              className="w-full rounded-lg border border-[#d8c5b3] bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            >
              {myBooks.map((b) => (
                <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8a7260]">Swap type</label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 rounded-lg border border-[#e2ddd4] p-3 text-sm cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-[#fdf4e7]">
                <input type="radio" name="swapMode" value="TEMPORARY" checked={swapMode === 'TEMPORARY'} onChange={() => setSwapMode('TEMPORARY')} className="mt-0.5" />
                <span>
                  <span className="block font-medium text-ink">Temporary loan</span>
                  <span className="block text-xs text-[#6b5744]">Trade for now, give each other's books back later.</span>
                </span>
              </label>
              <label className="flex items-start gap-2 rounded-lg border border-[#e2ddd4] p-3 text-sm cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-[#fdf4e7]">
                <input type="radio" name="swapMode" value="PERMANENT" checked={swapMode === 'PERMANENT'} onChange={() => setSwapMode('PERMANENT')} className="mt-0.5" />
                <span>
                  <span className="block font-medium text-ink">Permanent trade</span>
                  <span className="block text-xs text-[#6b5744]">Keep each other's books for good, no return expected.</span>
                </span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={submitting}>{submitting ? 'Sending…' : 'Send swap offer'}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default function Marketplace() {
  const { user, token } = useAuth()
  const [books, setBooks] = useState([])
  const [myBooks, setMyBooks] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [swapTarget, setSwapTarget] = useState(null)

  const loadBooks = useCallback(async () => {
    try {
      const all = await bookService.getAll(token)
      setBooks(all.filter(b => b.status === 'AVAILABLE' && b.ownerId !== user?.id))
      setMyBooks(all.filter(b => b.status === 'AVAILABLE' && b.ownerId === user?.id))
      setError('')
    } catch (err) {
      setError(errorMessage(err, 'Failed to load books.'))
    }
  }, [token, user])

  useEffect(() => { loadBooks() }, [loadBooks])

  const handleBorrow = async (bookId) => {
    setError('')
    setNotice('')
    try {
      await requestService.create({ bookId }, token)
      setNotice('Borrow request sent.')
    } catch (err) {
      setError(errorMessage(err, 'Failed to send borrow request.'))
    }
  }

  const handleSwapSubmit = async ({ offeredBookId, swapMode }) => {
    await requestService.create({ bookId: swapTarget.id, type: 'SWAP', offeredBookId, swapMode }, token)
    setSwapTarget(null)
    setNotice('Swap offer sent.')
  }

  return (
    <div className="p-6 text-ink">
      <h2 className="mb-4 text-2xl font-semibold font-serif">Marketplace</h2>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {notice && <p className="mb-4 text-sm text-green-700">{notice}</p>}
      {books.length === 0 && !error ? (
        <p className="text-sm text-[#6b5744]">No books available right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onBorrow={handleBorrow} onSwap={() => setSwapTarget(book)} />
          ))}
        </div>
      )}

      {swapTarget && (
        <SwapModal
          book={swapTarget}
          myBooks={myBooks}
          onClose={() => setSwapTarget(null)}
          onSubmit={handleSwapSubmit}
        />
      )}
    </div>
  )
}
