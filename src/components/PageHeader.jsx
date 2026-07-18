import React from 'react'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1e1810] font-serif">{title}</h1>
        {subtitle && <p className="text-sm text-[#6b5744] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
