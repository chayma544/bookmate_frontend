import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import requestService from '../services/requestService'
import PageHeader from '../components/PageHeader'
import { timeAgo, timeUntil, formatDate } from '../utils/time'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

const STATUS_BADGE = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
}

function describeType(req) {
  if (req.type === 'SWAP') return req.swapMode === 'PERMANENT' ? 'Permanent swap' : 'Temporary swap'
  return 'Borrow'
}

function sortRequests(a, b) {
  const rank = { PENDING: 0, APPROVED: 1, REJECTED: 2, EXPIRED: 2 }
  return (rank[a.status] ?? 3) - (rank[b.status] ?? 3) || new Date(b.updatedAt) - new Date(a.updatedAt)
}

function RequestCard({ req, perspective, onAccept, onDecline, onReturn, busy }) {
  const other = perspective === 'incoming' ? req.borrower : req.book.owner
  const otherName = other ? `${other.firstName} ${other.lastName}` : 'Someone'

  const isActive = req.status === 'APPROVED' && !req.returnedAt
  const canReturn = isActive && !(req.type === 'SWAP' && req.swapMode === 'PERMANENT')
  const myConfirmed = perspective === 'incoming' ? req.returnConfirmedByOwner : req.returnConfirmedByBorrower
  const theirConfirmed = perspective === 'incoming' ? req.returnConfirmedByBorrower : req.returnConfirmedByOwner

  return (
    <div className="rounded-xl border border-[#efe0cf] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">
            {perspective === 'incoming' ? `${otherName} wants ` : 'You requested '}
            <span className="italic">{req.book.title}</span>
            {perspective === 'outgoing' && ` from ${otherName}`}
          </p>
          <p className="mt-1 text-xs text-[#6b5744]">
            {describeType(req)}
            {req.type === 'SWAP' && req.offeredBook && ` · offering "${req.offeredBook.title}"`}
          </p>
          <p className="mt-1 text-xs text-[#9d7c5e]">
            {req.status === 'PENDING' && req.respondBy && `Respond by ${formatDate(req.respondBy)} (${timeUntil(req.respondBy)})`}
            {req.status === 'APPROVED' && !req.returnedAt && req.dueDate && `Due ${formatDate(req.dueDate)}`}
            {req.status === 'APPROVED' && !req.returnedAt && !req.dueDate && 'Trade completed'}
            {req.returnedAt && `Returned ${timeAgo(req.returnedAt)}`}
            {(req.status === 'REJECTED' || req.status === 'EXPIRED') && `${req.status === 'REJECTED' ? 'Declined' : 'Expired'} ${timeAgo(req.updatedAt)}`}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[req.status]}`}>{req.status}</span>
      </div>

      {perspective === 'incoming' && req.status === 'PENDING' && (
        <div className="mt-3 flex gap-2">
          <button disabled={busy} onClick={() => onAccept(req)} className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-[#7a3010] disabled:opacity-60">Accept</button>
          <button disabled={busy} onClick={() => onDecline(req)} className="rounded-full border border-[#e2ddd4] px-3 py-1 text-xs text-[#6b5744] hover:bg-[#f5ede0] disabled:opacity-60">Decline</button>
        </div>
      )}
      {canReturn && !myConfirmed && !theirConfirmed && (
        <div className="mt-3">
          <button disabled={busy} onClick={() => onReturn(req)} className="rounded-full border border-[#d8c5b3] px-3 py-1 text-xs font-medium text-[#6b5744] hover:bg-[#f5ede0] disabled:opacity-60">Mark as returned</button>
        </div>
      )}
      {canReturn && myConfirmed && !theirConfirmed && (
        <p className="mt-3 text-xs text-[#9d7c5e]">Waiting for {otherName} to confirm the return.</p>
      )}
      {canReturn && !myConfirmed && theirConfirmed && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-800">{otherName} confirmed this was returned — do you confirm?</p>
          <button disabled={busy} onClick={() => onReturn(req)} className="mt-2 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60">Confirm return</button>
        </div>
      )}
    </div>
  )
}

export default function BorrowRequests() {
  const { user, token } = useAuth()
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const all = await requestService.getAll(token)
      setRequests(all)
      setError('')
    } catch (err) {
      setError(errorMessage(err, 'Failed to load requests.'))
    }
  }, [token])

  useEffect(() => { if (user) load() }, [user, load])

  const incoming = requests.filter(r => r.book.ownerId === user?.id).sort(sortRequests)
  const outgoing = requests.filter(r => r.borrowerId === user?.id).sort(sortRequests)

  const act = async (fn, id) => {
    setBusyId(id)
    setError('')
    try {
      await fn()
      await load()
    } catch (err) {
      setError(errorMessage(err, 'Action failed.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleAccept = (req) => act(() => requestService.update(req.id, { status: 'APPROVED' }, token), req.id)
  const handleDecline = (req) => act(() => requestService.update(req.id, { status: 'REJECTED' }, token), req.id)
  const handleReturn = (req) => act(() => requestService.returnBook(req.id, token), req.id)

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader title="Borrow Requests" subtitle="Track what's coming in and what you've asked for" />
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
            <span className="text-sm font-semibold text-[#1e1810]">Incoming</span>
            <span className="text-xs text-[#6b5744]">people want your books</span>
          </div>
          <div className="p-4">
            {incoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#6b5744]">No incoming requests.</p>
            ) : (
              <div className="space-y-3">
                {incoming.map((req) => (
                  <RequestCard key={req.id} req={req} perspective="incoming" onAccept={handleAccept} onDecline={handleDecline} onReturn={handleReturn} busy={busyId === req.id} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
            <span className="text-sm font-semibold text-[#1e1810]">Outgoing</span>
            <span className="text-xs text-[#6b5744]">your requests to others</span>
          </div>
          <div className="p-4">
            {outgoing.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#6b5744]">You haven't requested any books yet.</p>
            ) : (
              <div className="space-y-3">
                {outgoing.map((req) => (
                  <RequestCard key={req.id} req={req} perspective="outgoing" onAccept={handleAccept} onDecline={handleDecline} onReturn={handleReturn} busy={busyId === req.id} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
