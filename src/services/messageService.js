import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getConversations: async (token) => {
    const res = await axios.get(`${API}/messages/conversations`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  getThread: async (userId, token) => {
    const res = await axios.get(`${API}/messages/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  send: async (userId, content, token) => {
    const res = await axios.post(`${API}/messages/${userId}`, { content }, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
