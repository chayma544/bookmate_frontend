import React, { useState } from 'react'
import Modal from './Modal'
import Button from './Button'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

export default function SwapModal({ book, myBooks, onClose, onSubmit }) {
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
