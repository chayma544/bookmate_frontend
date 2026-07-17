import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import MyBooks from './pages/MyBooks'
import BorrowRequests from './pages/BorrowRequests'
import Profile from './pages/Profile'
import { AuthProvider, useAuth } from './context/AuthContext'

function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/app" element={<Protected><Dashboard /></Protected>} />
        <Route path="/app/marketplace" element={<Protected><Marketplace /></Protected>} />
        <Route path="/app/my-books" element={<Protected><MyBooks /></Protected>} />
        <Route path="/app/requests" element={<Protected><BorrowRequests /></Protected>} />
        <Route path="/app/profile" element={<Protected><Profile /></Protected>} />
      </Routes>
    </AuthProvider>
  )
}
