import React, { useEffect, useState, useCallback } from 'react'
import BookCard from '../components/BookCard'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import bookService from '../services/bookService'

export default function MyBooks() {
  const { user, token } = useAuth()
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')

  const loadBooks = useCallback(async () => {
    try {
      const all = await bookService.getAll(token)
      setBooks(all.filter(b => b.ownerId === user.id))
      setError('')
    } catch (err) {
      setError(err?.message || 'Failed to load books.')
    }
  }, [token, user])

  useEffect(() => { if (user) loadBooks() }, [user, loadBooks])

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader title="My Library" subtitle="Every book you own, in one shelf" />

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{error}</p>}

      <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
          <span className="text-sm font-semibold text-[#1e1810]">My books</span>
          <span className="text-xs text-[#6b5744]">{books.length} book{books.length !== 1 ? 's' : ''}</span>
        </div>
        {books.length === 0 && !error ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ede0] text-xl">📖</div>
            <p className="text-sm text-[#6b5744]">You haven't added any books yet.</p>
            <p className="text-xs text-[#9d7c5e] mt-1">Head to the Dashboard to add your first book.</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
