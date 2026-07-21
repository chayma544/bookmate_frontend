import React, { useState } from 'react'
import Button from './Button'
import ImageUploadField from './ImageUploadField'

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback
}

const EMPTY_FORM = { title: '', author: '', genre: '', imageUrl: '' }

export default function BookForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
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

  return (
    <div>
      <div className="space-y-3 mb-5">
        {[['Title','title','e.g. The Alchemist'],['Author','author','e.g. Paulo Coelho'],['Genre','genre','e.g. Fiction']].map(([label,key,ph]) => (
          <div key={key}>
            <label className="block text-xs text-[#6b5744] mb-1">{label}</label>
            <input className={inputClass} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
          </div>
        ))}
        <ImageUploadField
          label="Cover image"
          value={form.imageUrl}
          onChange={(url) => set('imageUrl', url)}
          onUploadingChange={setUploading}
          previewAlt="Cover preview"
        />
        {initial && (
          <p className="text-[11px] text-[#9d7c5e]">
            Status is managed automatically as borrow and swap requests are approved or returned — it isn't set manually.
          </p>
        )}
      </div>
      {saveError && <p className="mb-3 text-[11px] text-red-600">{saveError}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={uploading || saving}>
          {saving ? 'Saving…' : submitLabel || (initial ? 'Save changes' : 'Add book')}
        </Button>
      </div>
    </div>
  )
}
