import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getAll: async (token) => {
    const res = await axios.get(`${API}/books`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  getById: async (id, token) => {
    const res = await axios.get(`${API}/books/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  create: async (book, token) => {
    const res = await axios.post(`${API}/books`, book, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  update: async (id, book, token) => {
    const res = await axios.put(`${API}/books/${id}`, book, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  delete: async (id, token) => {
    await axios.delete(`${API}/books/${id}`, { headers: { Authorization: `Bearer ${token}` } })
  },
}
