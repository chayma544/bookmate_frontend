import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import userService from '../services/userService'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

export default function AdminUsers() {
  const { user: currentUser, token } = useAuth()
  const [users, setUsers] = useState([])
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadUsers = useCallback(async () => {
    try {
      const all = await userService.getAll(token)
      setUsers(all)
      setLoadError('')
    } catch (err) {
      setLoadError(errorMessage(err, 'Failed to load users.'))
    }
  }, [token])

  useEffect(() => { loadUsers() }, [loadUsers])

  const toggleArchived = async (u) => {
    setBusyId(u.id)
    setActionError('')
    try {
      await userService.setArchived(u.id, !u.archived, token)
      await loadUsers()
      setNotice(u.archived ? `${u.firstName} can sign in again.` : `${u.firstName} has been archived.`)
    } catch (err) {
      setActionError(errorMessage(err, 'Action failed.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader
        title="Manage Users"
        subtitle="Everyone with a BookMate account"
        action={<Link to="/app/admin/users/new"><Button variant="primary">+ Add user</Button></Link>}
      />

      {loadError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{loadError}</p>}
      {actionError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-100">{actionError}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 border border-emerald-100">{notice}</p>}

      <div className="bg-white rounded-xl border border-[#e2ddd4] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2ddd4]">
          <span className="text-sm font-semibold text-[#1e1810]">All users</span>
          <span className="text-xs text-[#6b5744]">{users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>

        {users.length === 0 && !loadError ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f5ede0] text-xl">👤</div>
            <p className="text-sm text-[#6b5744]">No users yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2ddd4] text-left text-xs uppercase tracking-wide text-[#9d7c5e]">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id
                const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase()
                return (
                  <tr key={u.id} className="border-b border-[#f0ebe1] last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f5ede0] text-xs font-semibold text-[#8B3A0F]">
                            {initials || 'U'}
                          </div>
                        )}
                        <span className="font-medium text-[#1e1810]">
                          {u.firstName} {u.lastName}{isSelf ? ' (you)' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#6b5744]">{u.email}</td>
                    <td className="px-5 py-3 text-[#6b5744]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${u.archived ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.archived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/app/admin/users/${u.id}/edit`}
                          className="rounded-full border border-[#e2ddd4] px-3 py-1 text-xs font-medium text-[#6b5744] transition-colors hover:border-[#8B3A0F] hover:bg-[#f5ede0] hover:text-[#8B3A0F]"
                        >
                          Edit
                        </Link>
                        {isSelf ? (
                          <span className="text-xs text-[#9d7c5e]">—</span>
                        ) : (
                          <button
                            type="button"
                            disabled={busyId === u.id}
                            onClick={() => toggleArchived(u)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                              u.archived
                                ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                : 'border-[#e2ddd4] text-[#6b5744] hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                            }`}
                          >
                            {busyId === u.id ? 'Working…' : u.archived ? 'Unarchive' : 'Archive'}
                          </button>
                        )}
                      </div>
                    </td>
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
