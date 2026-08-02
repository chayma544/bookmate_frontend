import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import bookService from '../services/bookService'
import BookForm from '../components/BookForm'

export default function AddBook() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (form) => {
    await bookService.create({
      title: form.title,
      author: form.author,
      category: form.genre,
      image: form.imageUrl,
      description: form.description,
    }, token)
    navigate('/app')
  }

  return (
    <div className="p-7" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-[#8B3A0F] hover:underline">
        ← Back
      </button>
      <div className="max-w-4xl">
        <h1 className="text-xl font-bold text-[#1e1810] font-serif mb-5">Add a book</h1>
        <BookForm onSubmit={handleSubmit} onCancel={() => navigate('/app')} submitLabel="Add book" />
      </div>
    </div>
  )
}
