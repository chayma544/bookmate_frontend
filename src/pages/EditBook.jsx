import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import bookService from '../services/bookService'
import BookForm from '../components/BookForm'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function toFormShape(book) {
  return {
    title: book.title,
    author: book.author,
    genre: book.genre || book.category || '',
    imageUrl: book.imageUrl || book.image || '',
    description: book.description || '',
  }
}

export default function EditBook() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    bookService.getById(id, token)
      .then((b) => !cancelled && setInitial(toFormShape(b)))
      .catch((err) => !cancelled && setLoadError(errorMessage(err, 'Failed to load book.')))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, token])

  const handleSubmit = async (form) => {
    await bookService.update(id, {
      title: form.title,
      author: form.author,
      category: form.genre,
      image: form.imageUrl,
      description: form.description,
    }, token)
    navigate(-1)
  }

  return (
    <div className="p-7" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-[#8B3A0F] hover:underline">
        ← Back
      </button>
      <div className="max-w-lg bg-white rounded-xl border border-[#e2ddd4] p-6">
        <h1 className="text-xl font-bold text-[#1e1810] font-serif mb-5">Edit book</h1>
        {loadError && <p className="mb-3 text-[11px] text-red-600">{loadError}</p>}
        {!loading && initial && (
          <BookForm initial={initial} onSubmit={handleSubmit} onCancel={() => navigate(-1)} submitLabel="Save changes" />
        )}
      </div>
    </div>
  )
}
