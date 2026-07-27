import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import userService from '../services/userService'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#e2ddd4] last:border-0">
      <span className="text-xs uppercase tracking-wide text-[#9d7c5e]">{label}</span>
      <span className="text-sm font-medium text-[#1e1810]">{value || '—'}</span>
    </div>
  )
}

export default function Profile() {
  const { user, token, updateUser } = useAuth()
  const [meetupSpot, setMeetupSpot] = useState(user?.meetupSpot || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const saveMeetupSpot = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const updated = await userService.updateMe({ meetupSpot }, token)
      updateUser({ meetupSpot: updated.meetupSpot })
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err, 'Failed to save.'))
    } finally {
      setSaving(false)
    }
  }

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

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-[#e2ddd4] p-6">
              <h3 className="text-sm font-semibold text-[#1e1810] mb-2">Account information</h3>
              <InfoRow label="First name" value={user.firstName} />
              <InfoRow label="Last name" value={user.lastName} />
              <InfoRow label="Email" value={user.email} />
            </div>

            <div className="bg-white rounded-xl border border-[#e2ddd4] p-6">
              <h3 className="text-sm font-semibold text-[#1e1810] mb-1">Favorite meetup spot</h3>
              <p className="text-xs text-[#6b5744] mb-3">
                Not your address — just a coffee shop or public place you like, in case someone wants to meet in person for a borrow or swap.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={meetupSpot}
                  onChange={(e) => { setMeetupSpot(e.target.value); setSaved(false) }}
                  placeholder="e.g. Café Nomad, downtown"
                  maxLength={120}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#e2ddd4] bg-[#f5ede0] text-[#1e1810] text-sm focus:outline-none focus:border-[#8B3A0F]"
                />
                <Button variant="primary" onClick={saveMeetupSpot} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
              {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
              {saved && !error && <p className="mt-2 text-[11px] text-emerald-600">Saved.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
