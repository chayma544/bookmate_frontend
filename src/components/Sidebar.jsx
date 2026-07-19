import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  {
    to: '/app',
    label: 'Overview',
    icon: (
      <path d="M3 10.5 12 4l9 6.5M5 9.5V19a1 1 0 0 0 1 1h4v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h4a1 1 0 0 0 1-1V9.5" />
    ),
  },
  {
    to: '/app/marketplace',
    label: 'Browse Books',
    icon: (
      <path d="M4 6.5C4 5.67 4.67 5 5.5 5H11v14H5.5A1.5 1.5 0 0 1 4 17.5v-11ZM20 6.5c0-.83-.67-1.5-1.5-1.5H13v14h5.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />
    ),
  },
  {
    to: '/app/my-books',
    label: 'My Library',
    icon: (
      <>
        <path d="M4 4.5h3.2v15H4a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1ZM9.2 4.5h3.2v15H9.2v-15ZM14.6 5.1l3.2-.7 3.1 14.6-3.2.7-3.1-14.6Z" />
      </>
    ),
  },
  {
    to: '/app/requests',
    label: 'Borrow Requests',
    icon: (
      <path d="M8 3v3M16 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2.5 9 2.2 2.2L15.5 12" />
    ),
  },
  {
    to: '/app/profile',
    label: 'Profile',
    icon: (
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
    ),
  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-secondary text-ink border-r border-[#e2ddd4]">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" />
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            </svg>
          </div>
          <span className="text-ink font-serif font-bold text-lg tracking-wide">BookMate</span>
        </div>
        <p className="text-xs mt-1.5 pl-[42px] text-[#6b5744] leading-snug">if you adore books, you're in the right place!</p>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-white text-primary font-semibold shadow-[0_2px_10px_rgba(139,58,15,0.12)]'
                  : 'text-[#6b5744] hover:bg-[#f3e4d5] hover:text-ink hover:translate-x-0.5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-primary" />}
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={isActive ? '#8B3A0F' : 'currentColor'}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  {icon}
                </svg>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[#e2ddd4]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#f3e4d5] cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 bg-primary shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{fullName || 'User'}</p>
            <p className="text-xs text-[#6b5744]">Member</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6b5744] hover:bg-white hover:text-primary transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
