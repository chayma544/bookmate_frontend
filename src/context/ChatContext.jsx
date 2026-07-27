import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import messageService from '../services/messageService'
import { connectSocket, disconnectSocket } from '../services/socket'

const ChatContext = createContext()
const MAX_WINDOWS = 3
const TOAST_TTL = 4000

export function ChatProvider({ children }) {
  const { user, token } = useAuth()
  const [usersById, setUsersById] = useState({})
  const [openWindows, setOpenWindows] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({})
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set())
  const [toasts, setToasts] = useState([])
  const usersByIdRef = useRef({})

  useEffect(() => { usersByIdRef.current = usersById }, [usersById])

  const upsertUser = useCallback((u) => {
    if (!u) return
    setUsersById((m) => ({ ...m, [u.id]: u }))
  }, [])

  const loadThread = useCallback((userId) => {
    if (!token) return
    messageService.getThread(userId, token)
      .then((messages) => {
        setOpenWindows((wins) => wins.map((w) => (w.userId === userId ? { ...w, messages, loading: false } : w)))
        setUnreadCounts((c) => ({ ...c, [userId]: 0 }))
      })
      .catch(() => {
        setOpenWindows((wins) => wins.map((w) => (w.userId === userId ? { ...w, loading: false } : w)))
      })
  }, [token])

  const openChat = useCallback((userSummary) => {
    if (!userSummary?.id) return
    upsertUser(userSummary)
    setOpenWindows((wins) => {
      if (wins.some((w) => w.userId === userSummary.id)) {
        return wins.map((w) => (w.userId === userSummary.id ? { ...w, minimized: false } : w))
      }
      const next = [...wins, { userId: userSummary.id, messages: [], loading: true, minimized: false }]
      return next.length > MAX_WINDOWS ? next.slice(next.length - MAX_WINDOWS) : next
    })
    loadThread(userSummary.id)
  }, [upsertUser, loadThread])

  const closeChat = useCallback((userId) => {
    setOpenWindows((wins) => wins.filter((w) => w.userId !== userId))
  }, [])

  const minimizeChat = useCallback((userId, minimized) => {
    setOpenWindows((wins) => wins.map((w) => (w.userId === userId ? { ...w, minimized } : w)))
    if (!minimized) loadThread(userId)
  }, [loadThread])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const sendMessage = useCallback(async (userId, content) => {
    if (!token || !user) return
    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, senderId: user.id, receiverId: userId, content, createdAt: new Date().toISOString(), readAt: null, pending: true }
    setOpenWindows((wins) => wins.map((w) => (w.userId === userId ? { ...w, messages: [...w.messages, optimistic] } : w)))
    try {
      const saved = await messageService.send(userId, content, token)
      setOpenWindows((wins) => wins.map((w) => (w.userId === userId
        ? { ...w, messages: w.messages.map((m) => (m.id === tempId ? saved : m)) }
        : w)))
    } catch {
      setOpenWindows((wins) => wins.map((w) => (w.userId === userId
        ? { ...w, messages: w.messages.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)) }
        : w)))
    }
  }, [token, user])

  useEffect(() => {
    if (!token) return
    messageService.getConversations(token)
      .then((convos) => {
        const counts = {}
        convos.forEach((c) => {
          upsertUser(c.user)
          if (c.unreadCount) counts[c.user.id] = c.unreadCount
        })
        setUnreadCounts(counts)
      })
      .catch(() => {})
  }, [token, upsertUser])

  useEffect(() => {
    if (!token || !user) return
    const socket = connectSocket(token)

    const onNewMessage = (message) => {
      const otherId = message.senderId
      setOpenWindows((wins) => {
        const win = wins.find((w) => w.userId === otherId)
        if (win && !win.minimized) {
          loadThread(otherId)
        } else {
          setUnreadCounts((c) => ({ ...c, [otherId]: (c[otherId] || 0) + 1 }))
          const toast = { id: message.id, userId: otherId, content: message.content }
          setToasts((t) => [...t, toast])
          setTimeout(() => dismissToast(toast.id), TOAST_TTL)
        }
        return wins
      })
    }

    const onMessagesRead = ({ by }) => {
      setOpenWindows((wins) => wins.map((w) => (w.userId === by
        ? { ...w, messages: w.messages.map((m) => (m.senderId === user.id && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m)) }
        : w)))
    }

    const onOnline = (id) => setOnlineUserIds((s) => new Set(s).add(id))
    const onOffline = (id) => setOnlineUserIds((s) => {
      const next = new Set(s)
      next.delete(id)
      return next
    })

    socket.on('message:new', onNewMessage)
    socket.on('messages:read', onMessagesRead)
    socket.on('presence:online', onOnline)
    socket.on('presence:offline', onOffline)

    return () => {
      socket.off('message:new', onNewMessage)
      socket.off('messages:read', onMessagesRead)
      socket.off('presence:online', onOnline)
      socket.off('presence:offline', onOffline)
    }
  }, [token, user, loadThread, dismissToast])

  useEffect(() => () => disconnectSocket(), [])

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0)
  const windows = openWindows.map((w) => ({ ...w, user: usersById[w.userId] }))

  const value = {
    openWindows: windows,
    unreadCounts,
    totalUnread,
    onlineUserIds,
    toasts,
    openChat,
    closeChat,
    minimizeChat,
    sendMessage,
    dismissToast,
    usersById,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
