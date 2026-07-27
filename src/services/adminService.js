import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default {
  getReturnDisputes: async (token) => {
    const res = await axios.get(`${API}/admin/return-disputes`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
