import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getAll: async (token) => {
    const res = await axios.get(`${API}/reports`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  create: async ({ reportedUserId, bookId, comment }, token) => {
    const res = await axios.post(`${API}/reports`, { reportedUserId, bookId, comment }, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
