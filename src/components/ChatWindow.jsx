import React, { useState, useRef, useEffect } from 'react'
import './ChatWindow.css'
import '../App.css'

export default function ChatWindow({
  messages,
  loading,
  sending,
  error,
  currentSession,
  onSend,
  onToggleSidebar,
  onNewSession,
  messagesEndRef
}) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  // 自适应输入框高度
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!input.trim() || sending) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="main-area">
      {/* 顶部栏 */}
      <div className="topbar">
        <button className="icon-btn menu-btn" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="topbar-title">
          {currentSession ? (currentSession.name || '新对话') : 'Cat\'s Home'}
        </div>
        <button className="icon-btn" onClick={onNewSession} title="新对话">
          ✏️
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <span className="close" onClick={() => {}}>✕</span>
        </div>
      )}

      {/* 消息列表 */}
      <div className="chat-messages">
        {loading ? (
          <div className="empty-state">
            <div className="emoji">⏳</div>
            <div className="subtitle">加载中...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🐱</div>
            <div className="title">Cat's Home</div>
            <div className="subtitle">跟你的 AI 伴侣说点什么吧～</div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))
        )}

        {/* AI 正在输入 */}
        {sending && (
          <div className="message assistant">
            <div className="message-avatar">🐱</div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="input-area">
        <form className="input-wrapper" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            rows={1}
            disabled={sending}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || sending}>
            ➤
          </button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const [showReasoning, setShowReasoning] = useState(false)

  if (message.role === 'system') return null

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'user' ? '🧑' : '🐱'}
      </div>
      <div className="message-content">
        {message.reasoning_content && (
          <>
            <div
              className="reasoning-toggle"
              onClick={() => setShowReasoning(!showReasoning)}
            >
              {showReasoning ? '▼ 隐藏思考过程' : '▶ 查看思考过程'}
            </div>
            {showReasoning && (
              <div className="reasoning-content">
                {message.reasoning_content}
              </div>
            )}
          </>
        )}
        <div className="message-bubble">
          {message.content}
        </div>
      </div>
    </div>
  )
}
