import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import userService from '../services/userService'
import Button from '../components/Button'
import ImageUploadField from '../components/ImageUploadField'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', profileImage: '' }

export default function EditUser() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    let cancelled = false
    userService.getById(id, token)
      .then((u) => {
        if (cancelled) return
        setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', profileImage: u.profileImage || '' })
      })
      .catch((err) => !cancelled && setLoadError(errorMessage(err, 'Failed to load user.')))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, token])

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.email || uploading || saving) return
    setSaving(true)
    setError('')
    try {
      const patch = { firstName: form.firstName, lastName: form.lastName, email: form.email, profileImage: form.profileImage }
      if (form.password) patch.password = form.password
      await userService.update(id, patch, token)
      navigate('/app/admin/users')
    } catch (err) {
      setError(errorMessage(err, 'Failed to save user.'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[#e2ddd4] bg-[#f5ede0] text-[#1e1810] text-sm focus:outline-none focus:border-[#8B3A0F]"

  if (loading) {
    return <div className="p-7" style={{ background: '#e1dac9', minHeight: '100%' }} />
  }

  return (
    <div className="p-7" style={{ background: '#e1dac9', minHeight: '100%' }}>
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-[#8B3A0F] hover:underline">
        ← Back
      </button>
      <div className="max-w-lg">
        <h1 className="text-xl font-bold text-[#1e1810] font-serif mb-5">Edit user</h1>

        {loadError && <p className="mb-3 text-[11px] text-red-600">{loadError}</p>}

        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#6b5744] mb-1">First name</label>
              <input className={inputClass} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Jane" />
            </div>
            <div>
              <label className="block text-xs text-[#6b5744] mb-1">Last name</label>
              <input className={inputClass} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#6b5744] mb-1">Email</label>
            <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
          </div>
          <div>
            <label className="block text-xs text-[#6b5744] mb-1">Password</label>
            <input type="password" className={inputClass} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Leave blank to keep current password" />
          </div>
          <ImageUploadField
            label="Profile picture"
            value={form.profileImage}
            onChange={(url) => set('profileImage', url)}
            onUploadingChange={setUploading}
            previewAlt="Profile preview"
          />
        </div>

        {error && <p className="mb-3 text-[11px] text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate('/app/admin/users')}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={uploading || saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </div>
    </div>
  )
}
