import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    setLoading(true)
    try {
      await register(form)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 text-ink">
      <h2 className="text-2xl font-semibold mb-4 font-serif">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-soft border border-[#efe0cf]">
        {error && <div className="text-[#8b3a0f]">{error}</div>}
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="w-full p-3 border border-[#d8c5b3] rounded-lg bg-white text-ink placeholder:text-[#8a7260] focus:border-primary focus:outline-none" />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="w-full p-3 border border-[#d8c5b3] rounded-lg bg-white text-ink placeholder:text-[#8a7260] focus:border-primary focus:outline-none" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border border-[#d8c5b3] rounded-lg bg-white text-ink placeholder:text-[#8a7260] focus:border-primary focus:outline-none" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="w-full p-3 border border-[#d8c5b3] rounded-lg bg-white text-ink placeholder:text-[#8a7260] focus:border-primary focus:outline-none" />
        <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" type="password" className="w-full p-3 border border-[#d8c5b3] rounded-lg bg-white text-ink placeholder:text-[#8a7260] focus:border-primary focus:outline-none" />
        <button className="w-full bg-primary text-white p-3 rounded-lg" disabled={loading}>{loading ? 'Signing up...' : 'Register'}</button>
      </form>
    </div>
  )
}
