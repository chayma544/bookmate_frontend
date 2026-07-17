import React from 'react'

export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="text-[#6b5744] mt-2">{description}</p>
    </div>
  )
}
