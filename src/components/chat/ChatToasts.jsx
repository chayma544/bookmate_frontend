import React from 'react'
import { useChat } from '../../context/ChatContext'

export default function ChatToasts() {
  const { toasts, dismissToast, usersById, openChat } = useChat()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const user = usersById[t.userId]
        const name = user ? `${user.firstName} ${user.lastName}` : 'New message'
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => { openChat(user || { id: t.userId }); dismissToast(t.id) }}
            className="w-72 rounded-xl border border-[#e2ddd4] bg-white p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          >
            <p className="text-sm font-semibold text-[#1e1810]">{name}</p>
            <p className="truncate text-xs text-[#6b5744]">{t.content}</p>
          </button>
        )
      })}
    </div>
  )
}
