import React from 'react'

export default function Button({ children, variant = 'primary', ...props }) {
  const baseClass = 'px-4 py-2 rounded font-medium transition-colors'
  const variants = {
    primary: 'bg-primary text-white hover:bg-[#7a3010]',
    secondary: 'bg-secondary text-ink hover:bg-[#e8ddd0]',
    outline: 'border-2 border-primary text-primary hover:bg-[#f3e4d5]',
  }
  return <button className={`${baseClass} ${variants[variant]}`} {...props}>{children}</button>
}
