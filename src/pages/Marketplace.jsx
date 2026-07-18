import React, { useEffect, useState, useCallback } from 'react'
import BookCard from '../components/BookCard'
import PageHeader from '../components/PageHeader'
import SwapModal from '../components/SwapModal'
import { useAuth } from '../context/AuthContext'
import bookService from '../services/bookService'
import requestService from '../services/requestService'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
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
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader title="Browse Books" subtitle="Discover what the community is lending and swapping" />

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 border border-emerald-100">{notice}</p>}

      <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
          <span className="text-sm font-semibold text-[#1e1810]">Available books</span>
          <span className="text-xs text-[#6b5744]">{books.length} book{books.length !== 1 ? 's' : ''}</span>
        </div>
        {books.length === 0 && !error ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ede0] text-xl">📚</div>
            <p className="text-sm text-[#6b5744]">No books available right now.</p>
            <p className="text-xs text-[#9d7c5e] mt-1">Check back soon, or add your own from the Dashboard.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} onBorrow={handleBorrow} onSwap={() => setSwapTarget(book)} />
              ))}
            </div>
          </div>
        )}
      </div>

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
