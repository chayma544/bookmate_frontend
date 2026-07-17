import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../layouts/AppLayout'
import Modal from '../components/Modal'
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

const EMPTY_FORM = { title: '', author: '', genre: '', imageUrl: '' }

// ─── sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subColor }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2ddd4] px-5 py-4 flex-1">
      <p className="text-xs text-[#6b5744] mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#1e1810]">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: subColor || '#9d7c5e' }}>{sub}</p>}
    </div>
  )
}

function BookForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.title || !form.author || uploading || saving) return
    setSaving(true)
    setSaveError('')
    try {
      await onSubmit(form)
    } catch (error) {
      setSaveError(errorMessage(error, 'Failed to save book.'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[#e2ddd4] bg-[#f5ede0] text-[#1e1810] text-sm focus:outline-none focus:border-[#8B3A0F]"

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const uploadToCloudinary = async (file) => {
    setUploading(true)
    setUploadError('')

    try {
      if (!cloudName || !uploadPreset) {
        throw new Error('Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your frontend env file.')
      }

      const payload = new FormData()
      payload.append('file', file)
      payload.append('upload_preset', uploadPreset)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: payload,
      })

      if (!response.ok) {
        throw new Error('Cloudinary upload failed. Check your preset and cloud name.')
      }

      const data = await response.json()
      set('imageUrl', data.secure_url)
    } catch (error) {
      setUploadError(error?.message || 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) uploadToCloudinary(file)
  }

  return (
    <div>
      <div className="space-y-3 mb-5">
        {[['Title','title','e.g. The Alchemist'],['Author','author','e.g. Paulo Coelho'],['Genre','genre','e.g. Fiction']].map(([label,key,ph]) => (
          <div key={key}>
            <label className="block text-xs text-[#6b5744] mb-1">{label}</label>
            <input className={inputClass} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
          </div>
        ))}
        <div>
          <label className="block text-xs text-[#6b5744] mb-1">Cover image URL</label>
          <input
            className={inputClass}
            value={form.imageUrl}
            onChange={e => set('imageUrl', e.target.value)}
            placeholder="Paste any direct image URL or a Cloudinary URL"
          />
          <p className="mt-1 text-[11px] text-[#9d7c5e]">
            You can paste an image link from any source, or upload a file to Cloudinary below.
          </p>
        </div>
        <div>
          <label className="block text-xs text-[#6b5744] mb-1">Upload image file</label>
          <input
            className="w-full text-sm text-[#6b5744] file:mr-4 file:rounded-full file:border-0 file:bg-[#8B3A0F] file:px-4 file:py-2 file:text-white hover:file:bg-[#7a3010]"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="mt-1 text-[11px] text-[#9d7c5e]">
            {uploading ? 'Uploading to Cloudinary...' : 'Unsigned upload requires your Cloudinary cloud name and upload preset.'}
          </p>
          {uploadError && <p className="mt-1 text-[11px] text-red-600">{uploadError}</p>}
          {form.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#e2ddd4] bg-[#fdf8f3]">
              <img src={form.imageUrl} alt="Cover preview" className="h-40 w-full object-cover" />
            </div>
          )}
        </div>
        {initial && (
          <p className="text-[11px] text-[#9d7c5e]">
            Status is managed automatically as borrow and swap requests are approved or returned — it isn't set manually.
          </p>
        )}
      </div>
      {saveError && <p className="mb-3 text-[11px] text-red-600">{saveError}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={uploading || saving}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add book'}
        </Button>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, token } = useAuth()
  const [books, setBooks]   = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState(null)
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

  const addBook = async (form) => {
    await bookService.create({
      title: form.title,
      author: form.author,
      category: form.genre,
      image: form.imageUrl,
    }, token)
    await loadAll()
    setModal(null)
  }

  const editBook = async (form) => {
    await bookService.update(modal.book.id, {
      title: form.title,
      author: form.author,
      category: form.genre,
      image: form.imageUrl,
    }, token)
    await loadAll()
    setModal(null)
  }

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

  const activeLoans = requests.filter(r => r.status === 'APPROVED' && !r.returnedAt)
  const incomingPending = requests
    .filter(r => r.book.ownerId === user?.id && r.status === 'PENDING')
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))

  const owned = books.length
  const lent = books.filter(b => b.status === 'borrowed').length
  const borrowed = activeLoans.filter(r => r.borrowerId === user?.id).length
    + activeLoans.filter(r => r.type === 'SWAP' && r.book.ownerId === user?.id).length
  const swaps = requests.filter(r =>
    r.type === 'SWAP' &&
    (r.borrowerId === user?.id || r.book.ownerId === user?.id) &&
    (r.status === 'PENDING' || (r.status === 'APPROVED' && !r.returnedAt))
  ).length

  return (
    <AppLayout>
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
            <Button variant="primary" onClick={() => setModal('add')}>+ Add book</Button>
          </div>
        </div>

        {/* stat cards */}
        <div className="flex gap-3 mb-6">
          <StatCard label="Total books owned" value={owned}    sub={`${owned} in library`} />
          <StatCard label="Books lent"        value={lent}     sub={lent ? `${lent} currently out` : 'None out'}   subColor="#d97706" />
          <StatCard label="Books borrowed"    value={borrowed} sub={borrowed ? 'Return soon' : 'None borrowed'}     subColor="#2563eb" />
          <StatCard label="Swap offers"       value={swaps}    sub={swaps ? `${swaps} active` : 'None active'}      subColor="#059669" />
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
                      onEdit={(selectedBook) => setModal({ book: selectedBook })}
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

      {/* modals */}
      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title="Add a book">
        <BookForm onSubmit={addBook} onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={!!modal?.book} onClose={() => setModal(null)} title="Edit book">
        <BookForm initial={modal?.book} onSubmit={editBook} onClose={() => setModal(null)} />
      </Modal>
    </AppLayout>
  )
}
