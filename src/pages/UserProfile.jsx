import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import BookCard from '../components/BookCard'
import userService from '../services/userService'
import bookService from '../services/bookService'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function formatMemberSince(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export default function UserProfile() {
  const { id } = useParams()
  const { user: me, token } = useAuth()
  const { openChat } = useChat()
  const [profile, setProfile] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([userService.getById(id, token), bookService.getAll(token)])
      .then(([u, allBooks]) => {
        if (cancelled) return
        setProfile(u)
        setBooks(allBooks.filter((b) => b.ownerId === id && b.status !== 'BORROWED'))
      })
      .catch((err) => !cancelled && setError(errorMessage(err, 'Failed to load this profile.')))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, token])

  if (me && id === me.id) return <Navigate to="/app/profile" replace />

  const fullName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') : ''
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      {loading ? (
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-44 rounded-2xl bg-white/60" />
        </div>
      ) : error ? (
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-[#e2ddd4] p-10 text-center text-sm text-red-600">
          {error}
        </div>
      ) : profile ? (
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-bookmate-gradient border border-[#e8d9c3] shadow-soft">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, #8B3A0F 0, transparent 45%), radial-gradient(circle at 80% 70%, #A56A43 0, transparent 40%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-10 sm:text-left">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt=""
                  className="h-24 w-24 flex-shrink-0 rounded-full object-cover ring-4 ring-white shadow-md sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-white ring-4 ring-white shadow-md sm:h-28 sm:w-28">
                  {initials}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#1e1810] font-serif sm:text-3xl">{fullName}</h1>
                <p className="mt-1 text-sm text-[#6b5744]">
                  {profile.createdAt ? `Member since ${formatMemberSince(profile.createdAt)}` : 'BookMate member'}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary">
                    {books.length} book{books.length !== 1 ? 's' : ''} to share
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openChat(profile)}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#7a3010]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
                </svg>
                Message
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#9d7c5e]">Books from {profile.firstName}</h2>
            {books.length === 0 ? (
              <div className="rounded-xl border border-[#e2ddd4] bg-white py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ede0] text-xl">📚</div>
                <p className="text-sm text-[#6b5744]">Nothing on the shelf right now.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
