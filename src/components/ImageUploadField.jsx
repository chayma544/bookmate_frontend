import React, { useState } from 'react'

export default function ImageUploadField({ label = 'Image', value, onChange, previewAlt = 'Preview', onUploadingChange }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const setUploadingState = (next) => {
    setUploading(next)
    onUploadingChange?.(next)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[#e2ddd4] bg-[#f5ede0] text-[#1e1810] text-sm focus:outline-none focus:border-[#8B3A0F]"

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const uploadToCloudinary = async (file) => {
    setUploadingState(true)
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
      onChange(data.secure_url)
    } catch (error) {
      setUploadError(error?.message || 'Image upload failed.')
    } finally {
      setUploadingState(false)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) uploadToCloudinary(file)
  }

  return (
    <div>
      <div>
        <label className="block text-xs text-[#6b5744] mb-1">{label} URL</label>
        <input
          className={inputClass}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste any direct image URL or a Cloudinary URL"
        />
        <p className="mt-1 text-[11px] text-[#9d7c5e]">
          You can paste an image link from any source, or upload a file to Cloudinary below.
        </p>
      </div>
      <div className="mt-3">
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
        {value && (
          <div className="mt-3 overflow-hidden rounded-xl border border-[#e2ddd4] bg-[#fdf8f3]">
            <img src={value} alt={previewAlt} className="h-40 w-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}
