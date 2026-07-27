import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getForUser: async (userId, token) => {
    const res = await axios.get(`${API}/users/${userId}/rating`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  rate: async (userId, { value, comment }, token) => {
    const res = await axios.post(`${API}/users/${userId}/rating`, { value, comment }, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
