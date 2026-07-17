import React from 'react'

export default function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-[#efe0cf]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-[#6b5744] text-2xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}
