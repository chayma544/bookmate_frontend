import React, { useState } from 'react'

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-lg',
}

export default function RatingStars({ value = 0, count, readOnly = false, size = 'md', onChange }) {
  const [hovered, setHovered] = useState(0)
  const rounded = Math.round(value || 0)
  const active = hovered || rounded

  return (
    <div className="inline-flex items-center gap-1">
      <div className={SIZE_CLASSES[size] || SIZE_CLASSES.md} onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            role={readOnly ? undefined : 'button'}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onClick={() => !readOnly && onChange && onChange(star)}
            className={`${readOnly ? '' : 'cursor-pointer'} ${star <= active ? 'text-[#f0a93a]' : 'text-[#d8c5b3]'}`}
          >
            {star <= active ? '★' : '☆'}
          </span>
        ))}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-[#9d7c5e]">
          {value ? `${value.toFixed(1)} (${count})` : 'No ratings yet'}
        </span>
      )}
    </div>
  )
}
