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
import AddBook from './pages/AddBook'
import BookDetail from './pages/BookDetail'
import AdminUsers from './pages/AdminUsers'
import AddUser from './pages/AddUser'
import EditUser from './pages/EditUser'
import AdminReports from './pages/AdminReports'
import AdminReturnDisputes from './pages/AdminReturnDisputes'
import UserProfile from './pages/UserProfile'
import AppLayout from './layouts/AppLayout'
import Loading from './components/Loading'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminProtected({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/app" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/app" element={<Protected><ChatProvider><AppLayout /></ChatProvider></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="my-books" element={<MyBooks />} />
          <Route path="books/new" element={<AddBook />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="requests" element={<BorrowRequests />} />
          <Route path="profile" element={<Profile />} />
          <Route path="users/:id" element={<UserProfile />} />
          <Route path="admin/users/new" element={<AdminProtected><AddUser /></AdminProtected>} />
          <Route path="admin/users/:id/edit" element={<AdminProtected><EditUser /></AdminProtected>} />
          <Route path="admin/users" element={<AdminProtected><AdminUsers /></AdminProtected>} />
          <Route path="admin/reports" element={<AdminProtected><AdminReports /></AdminProtected>} />
          <Route path="admin/return-disputes" element={<AdminProtected><AdminReturnDisputes /></AdminProtected>} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
