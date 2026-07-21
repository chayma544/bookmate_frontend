import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getForBook: async (bookId, token) => {
    const res = await axios.get(`${API}/books/${bookId}/ratings`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  rate: async (bookId, { value, comment }, token) => {
    const res = await axios.post(`${API}/books/${bookId}/ratings`, { value, comment }, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
