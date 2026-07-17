import React, { useEffect, useState, useCallback } from 'react'
import BookCard from '../components/BookCard'
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
    <div className="p-6 text-ink">
      <h2 className="mb-4 text-2xl font-semibold font-serif">My Books</h2>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {books.length === 0 && !error ? (
        <p className="text-sm text-[#6b5744]">You haven't added any books yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
