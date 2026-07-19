import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getAll: async (token) => {
    const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  create: async (user, token) => {
    const res = await axios.post(`${API}/users`, user, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
  setArchived: async (id, archived, token) => {
    const res = await axios.put(`${API}/users/${id}`, { archived }, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
