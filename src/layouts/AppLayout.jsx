import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatDock from '../components/chat/ChatDock'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <Sidebar />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <ChatDock />
    </div>
  )
}