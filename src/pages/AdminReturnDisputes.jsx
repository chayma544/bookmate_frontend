import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import PageHeader from '../components/PageHeader'
import adminService from '../services/adminService'
import { timeAgo } from '../utils/time'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

export default function AdminReturnDisputes() {
  const { token } = useAuth()
  const { openChat } = useChat()
  const [disputes, setDisputes] = useState([])
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    try {
      const all = await adminService.getReturnDisputes(token)
      setDisputes(all)
      setLoadError('')
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load return disputes.'))
    }
  }, [token])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader title="Return disputes" subtitle="One side confirmed a return over a week ago, but the other hasn't" />

      {loadError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{loadError}</p>}

      <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
          <span className="text-sm font-semibold text-[#1e1810]">Pending confirmations</span>
          <span className="text-xs text-[#6b5744]">{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</span>
        </div>

        {disputes.length === 0 && !loadError ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ede0] text-xl">✅</div>
            <p className="text-sm text-[#6b5744]">Nothing stuck right now.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2ddd4] text-left text-xs uppercase tracking-wide text-[#9d7c5e]">
                <th className="px-5 py-3 font-medium">Book</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Borrower</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => {
                const owner = d.book.owner
                const borrower = d.borrower
                const ownerConfirmed = !!d.returnConfirmedByOwner
                const borrowerConfirmed = !!d.returnConfirmedByBorrower
                const confirmedAt = d.returnConfirmedByOwner || d.returnConfirmedByBorrower
                return (
                  <tr key={d.id} className="border-b border-[#f0ebe1] last:border-0 align-top">
                    <td className="px-5 py-3 text-[#3a2e22]">{d.book.title}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#1e1810]">{owner.firstName} {owner.lastName}</p>
                      <p className="text-xs text-[#6b5744]">{owner.email}</p>
                      <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ownerConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                        {ownerConfirmed ? 'Confirmed' : 'Not confirmed'}
                      </span>
                      <button type="button" onClick={() => openChat(owner)} className="mt-1 block text-xs font-medium text-primary hover:underline">Message</button>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#1e1810]">{borrower.firstName} {borrower.lastName}</p>
                      <p className="text-xs text-[#6b5744]">{borrower.email}</p>
                      <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${borrowerConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                        {borrowerConfirmed ? 'Confirmed' : 'Not confirmed'}
                      </span>
                      <button type="button" onClick={() => openChat(borrower)} className="mt-1 block text-xs font-medium text-primary hover:underline">Message</button>
                    </td>
                    <td className="px-5 py-3 text-[#6b5744]">Confirmed {timeAgo(confirmedAt)}, still waiting on the other side</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
