import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'

function initialsOf(u) {
  const f = u?.firstName?.[0] || ''
  const l = u?.lastName?.[0] || ''
  return (f + l).toUpperCase() || 'U'
}

function Avatar({ user, online, size = 32 }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {user?.profileImage ? (
        <img src={user.profileImage} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f5ede0] text-xs font-semibold text-[#8B3A0F]">
          {initialsOf(user)}
        </div>
      )}
      {online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
    </div>
  )
}

export default function ChatWindow({ win }) {
  const { user: me } = useAuth()
  const { closeChat, minimizeChat, sendMessage, onlineUserIds } = useChat()
  const [draft, setDraft] = useState('')
  const listRef = useRef(null)
  const online = onlineUserIds.has(win.userId)
  const name = win.user ? `${win.user.firstName} ${win.user.lastName}` : 'Chat'

  useEffect(() => {
    if (listRef.current && !win.minimized) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [win.messages, win.minimized])

  const submit = () => {
    const content = draft.trim()
    if (!content) return
    sendMessage(win.userId, content)
    setDraft('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={`flex w-72 flex-col rounded-t-xl border border-[#e2ddd4] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] ${win.minimized ? '' : 'h-96'}`}>
      <button
        type="button"
        onClick={() => minimizeChat(win.userId, !win.minimized)}
        className="flex items-center gap-2 rounded-t-xl bg-primary px-3 py-2 text-left text-white"
      >
        <Avatar user={win.user} online={online} size={26} />
        <span className="flex-1 truncate text-sm font-medium">{name}</span>
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); closeChat(win.userId) }}
          className="flex h-5 w-5 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white"
        >
          &times;
        </span>
      </button>

      {!win.minimized && (
        <>
          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-[#faf6ef] px-3 py-3">
            {win.loading ? (
              <p className="text-center text-xs text-[#9d7c5e]">Loading…</p>
            ) : win.messages.length === 0 ? (
              <p className="text-center text-xs text-[#9d7c5e]">Say hello 👋</p>
            ) : (
              win.messages.map((m, idx) => {
                const mine = m.senderId === me?.id
                const isLast = idx === win.messages.length - 1
                return (
                  <div key={m.id} className="flex flex-col">
                    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${
                          mine ? 'bg-primary text-white' : 'bg-white text-[#1e1810] border border-[#e2ddd4]'
                        } ${m.failed ? 'opacity-60' : ''}`}
                      >
                        {m.content}
                      </div>
                    </div>
                    {mine && isLast && m.readAt && (
                      <span className="mt-0.5 text-right text-[10px] text-[#9d7c5e]">Seen</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-[#e2ddd4] p-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Aa"
              className="flex-1 rounded-full border border-[#e2ddd4] bg-[#f5ede0] px-3 py-1.5 text-sm text-[#1e1810] focus:outline-none focus:border-[#8B3A0F]"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  )
}
