import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const client = axios.create({
  baseURL: API,
})

export default {
  register: async (payload) => {
    const res = await client.post('/auth/register', payload)
    return res.data
  },
  login: async (payload) => {
    const res = await client.post('/auth/login', payload)
    return res.data
  },
  getMe: async (token) => {
    const res = await client.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
    return res.data
  },
}
