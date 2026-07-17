import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getAll: async (token) => {
    const res = await axios.get(`${API}/requests`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  create: async (request, token) => {
    const res = await axios.post(`${API}/requests`, request, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  update: async (id, request, token) => {
    const res = await axios.put(`${API}/requests/${id}`, request, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  returnBook: async (id, token) => {
    const res = await axios.put(`${API}/requests/${id}/return`, {}, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
