import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { timeAgo } from '../utils/time'

export default function NotificationBell() {
  const { notifications, unreadNotifications, markAllNotificationsRead } = useChat()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const toggle = () => {
    setOpen((o) => {
      const next = !o
      if (next) markAllNotificationsRead()
      return next
    })
  }

  const handleClick = (n) => {
    setOpen(false)
    navigate(n.link || '/app')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        title="Notifications"
        className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#6b5744] hover:bg-white hover:text-primary transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white ring-2 ring-secondary">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl border border-[#e2ddd4] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <div className="border-b border-[#e2ddd4] px-4 py-2.5">
            <span className="text-sm font-semibold text-[#1e1810]">Notifications</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-[#9d7c5e]">Nothing yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-2 border-b border-[#f0ebe1] px-4 py-3 text-left last:border-0 hover:bg-[#f5ede0] ${!n.read ? 'bg-[#fdf6ec]' : ''}`}
                >
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />}
                  <span className={`min-w-0 flex-1 ${n.read ? 'pl-3.5' : ''}`}>
                    <span className="block text-sm font-medium text-[#1e1810]">{n.title}</span>
                    {n.body && <span className="block truncate text-xs text-[#6b5744]">{n.body}</span>}
                    <span className="block text-[10px] text-[#9d7c5e] mt-0.5">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
