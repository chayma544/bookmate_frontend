import React from 'react'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#e2ddd4] last:border-0">
      <span className="text-xs uppercase tracking-wide text-[#9d7c5e]">{label}</span>
      <span className="text-sm font-medium text-[#1e1810]">{value || '—'}</span>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="p-7 text-ink" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <PageHeader title="Profile" subtitle="Your account details" />

      {!user ? (
        <div className="bg-white rounded-xl border border-[#e2ddd4] p-10 text-center text-sm text-[#6b5744]">
          No user loaded.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="bg-white rounded-xl border border-[#e2ddd4] p-6 flex flex-col items-center text-center lg:col-span-1">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-white bg-primary shadow-sm">
              {initials}
            </div>
            <p className="mt-4 text-lg font-semibold text-[#1e1810]">{fullName || 'User'}</p>
            <p className="text-sm text-[#6b5744]">{user.email}</p>
            <span className="mt-3 inline-flex items-center rounded-full bg-[#f5ede0] px-3 py-1 text-xs font-semibold text-primary">
              Member
            </span>
          </div>

          <div className="bg-white rounded-xl border border-[#e2ddd4] p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#1e1810] mb-2">Account information</h3>
            <InfoRow label="First name" value={user.firstName} />
            <InfoRow label="Last name" value={user.lastName} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="User ID" value={user.id} />
          </div>
        </div>
      )}
    </div>
  )
}
