import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import userService from '../services/userService'
import reportService from '../services/reportService'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

export default function AdminReports() {
  const { token } = useAuth()
  const [reports, setReports] = useState([])
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadReports = useCallback(async () => {
    try {
      const all = await reportService.getAll(token)
      setReports(all)
      setLoadError('')
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load reports.'))
    }
  }, [token])

  useEffect(() => { loadReports() }, [loadReports])

  const toggleArchived = async (reportedUser) => {
    setBusyId(reportedUser.id)
    setActionError('')
    try {
      await userService.setArchived(reportedUser.id, !reportedUser.archived, token)
      await loadReports()
      setNotice(reportedUser.archived ? `${reportedUser.firstName} can sign in again.` : `${reportedUser.firstName} has been archived.`)
    } catch (err) {
      setActionError(errorMessage(err, 'Action failed.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader title="Reports" subtitle="Complaints filed by users about other users" />

      {loadError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{loadError}</p>}
      {actionError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{actionError}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 border border-emerald-100">{notice}</p>}

      <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
          <span className="text-sm font-semibold text-[#1e1810]">All reports</span>
          <span className="text-xs text-[#6b5744]">{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
        </div>

        {reports.length === 0 && !loadError ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ede0] text-xl">🚩</div>
            <p className="text-sm text-[#6b5744]">No reports yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2ddd4] text-left text-xs uppercase tracking-wide text-[#9d7c5e]">
                <th className="px-5 py-3 font-medium">Reporter</th>
                <th className="px-5 py-3 font-medium">Reported user</th>
                <th className="px-5 py-3 font-medium">Book</th>
                <th className="px-5 py-3 font-medium">Comment</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-[#f0ebe1] last:border-0 align-top">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1e1810]">{r.reporter.firstName} {r.reporter.lastName}</p>
                    <p className="text-xs text-[#6b5744]">{r.reporter.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1e1810]">{r.reportedUser.firstName} {r.reportedUser.lastName}</p>
                    <p className="text-xs text-[#6b5744]">{r.reportedUser.email}</p>
                    <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.reportedUser.archived ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {r.reportedUser.archived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6b5744]">{r.book?.title || '—'}</td>
                  <td className="px-5 py-3 text-[#3a2e22] max-w-xs">{r.comment}</td>
                  <td className="px-5 py-3 text-[#6b5744]">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      disabled={busyId === r.reportedUser.id}
                      onClick={() => toggleArchived(r.reportedUser)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                        r.reportedUser.archived
                          ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          : 'border-[#e2ddd4] text-[#6b5744] hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      {busyId === r.reportedUser.id ? 'Working…' : r.reportedUser.archived ? 'Unarchive' : 'Archive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
