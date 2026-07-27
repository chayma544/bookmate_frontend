import React, { useEffect, useState, useCallback } from 'react'
import BookCard from '../components/BookCard'
import PageHeader from '../components/PageHeader'
import SwapModal from '../components/SwapModal'
import Modal from '../components/Modal'
import BookForm from '../components/BookForm'
import { useAuth } from '../context/AuthContext'
import bookService from '../services/bookService'
import requestService from '../services/requestService'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function toFormShape(book) {
  return {
    title: book.title,
    author: book.author,
    genre: book.genre || book.category || '',
    imageUrl: book.imageUrl || book.image || '',
  }
}

export default function Marketplace() {
  const { user, token, isAdmin } = useAuth()
  const [books, setBooks] = useState([])
  const [myBooks, setMyBooks] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [swapTarget, setSwapTarget] = useState(null)
  const [editingBook, setEditingBook] = useState(null)

  const loadBooks = useCallback(async () => {
    try {
      const all = await bookService.getAll(token)
      setBooks(isAdmin ? all : all.filter(b => b.status === 'AVAILABLE' && b.ownerId !== user?.id))
      setMyBooks(all.filter(b => b.status === 'AVAILABLE' && b.ownerId === user?.id))
      setError('')
    } catch (err) {
      setError(errorMessage(err, 'Failed to load books.'))
    }
  }, [token, user, isAdmin])

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

  const handleEditSubmit = async (form) => {
    await bookService.update(editingBook.id, {
      title: form.title,
      author: form.author,
      category: form.genre,
      image: form.imageUrl,
    }, token)
    await loadBooks()
    setEditingBook(null)
  }

  const handleDelete = async (id) => {
    try {
      await bookService.delete(id, token)
      await loadBooks()
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete book.'))
    }
  }

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader title="Browse Books" subtitle={isAdmin ? 'Every book on the platform, across every member' : 'Discover what the community is lending and swapping'} />

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 border border-emerald-100">{notice}</p>}

      <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
          <span className="text-sm font-semibold text-[#1e1810]">{isAdmin ? 'All books' : 'Available books'}</span>
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
              {books.map((book) => {
                const ownedByViewer = book.ownerId === user?.id
                const available = book.status === 'AVAILABLE'
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    onBorrow={!ownedByViewer && available ? handleBorrow : undefined}
                    onSwap={!ownedByViewer && available ? () => setSwapTarget(book) : undefined}
                    onEdit={isAdmin ? (selectedBook) => setEditingBook({ id: selectedBook.id, ...toFormShape(selectedBook) }) : undefined}
                    onDelete={isAdmin ? handleDelete : undefined}
                  />
                )
              })}
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

      {isAdmin && (
        <Modal isOpen={!!editingBook} onClose={() => setEditingBook(null)} title="Edit book">
          <BookForm initial={editingBook} onSubmit={handleEditSubmit} onCancel={() => setEditingBook(null)} submitLabel="Save changes" />
        </Modal>
      )}
    </div>
  )
}
