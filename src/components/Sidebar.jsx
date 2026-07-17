import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/marketplace', label: 'Browse Books' },
  { to: '/app/my-books', label: 'My Library' },
  { to: '/app/requests', label: 'Borrow Requests' },
  { to: '/app/profile', label: 'Profile' },
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
    <aside className="w-56 flex-shrink-0 flex flex-col bg-secondary text-ink">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="text-ink font-serif font-bold text-base tracking-wide">BookMate</span>
        </div>
        <p className="text-xs mt-1 pl-8 text-[#6b5744]">if you adore books, you're in the right place!</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#e8ddd0] text-ink font-medium'
                  : 'text-[#6b5744] hover:bg-[#f3e4d5] hover:text-ink'
              }`
            }
          >
            <span className="text-base w-5 text-center" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[#e2ddd4]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#f3e4d5] cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 bg-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{fullName || 'User'}</p>
            <p className="text-xs text-[#6b5744]">Member</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="text-[#6b5744] hover:text-primary text-lg leading-none"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}