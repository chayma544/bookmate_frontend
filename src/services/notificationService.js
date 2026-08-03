import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getAll: async (token) => {
    const res = await axios.get(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  markAllRead: async (token) => {
    await axios.put(`${API}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } })
  },
}
