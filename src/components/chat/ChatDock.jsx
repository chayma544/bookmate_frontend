import React from 'react'
import { useChat } from '../../context/ChatContext'
import ChatWindow from './ChatWindow'
import ChatToasts from './ChatToasts'

export default function ChatDock() {
  const { openWindows } = useChat()

  return (
    <>
      <ChatToasts />
      {openWindows.length > 0 && (
        <div className="fixed bottom-0 right-4 z-40 flex items-end gap-3">
          {openWindows.map((win) => (
            <ChatWindow key={win.userId} win={win} />
          ))}
        </div>
      )}
    </>
  )
}
