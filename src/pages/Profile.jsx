import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  return (
    <div className="p-6 text-ink">
      <h2 className="text-2xl font-semibold mb-4 font-serif">Profile</h2>
      <div className="p-4 bg-white rounded-xl shadow-soft border border-[#efe0cf]">
        <p>{user ? `${user.firstName} ${user.lastName}` : 'No user loaded'}</p>
      </div>
    </div>
  )
}
