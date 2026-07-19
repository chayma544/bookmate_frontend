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
import BookDetail from './pages/BookDetail'
import AppLayout from './layouts/AppLayout'
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

        <Route path="/app" element={<Protected><AppLayout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="my-books" element={<MyBooks />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="requests" element={<BorrowRequests />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
