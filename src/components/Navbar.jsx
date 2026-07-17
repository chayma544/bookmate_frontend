import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-secondary p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold font-serif text-ink">BookMate</Link>
        <div className="space-x-4">
          <Link to="/app" className="text-ink">Dashboard</Link>
          <Link to="/app/marketplace" className="text-ink">Marketplace</Link>
          <Link to="/app/my-books" className="text-ink">My Books</Link>
          <Link to="/app/requests" className="text-ink">Requests</Link>
          {/* <Link to="/app/profile" className="text-blue-600">Profile</Link> */}
        </div>
      </div>
    </nav>
  )
}
