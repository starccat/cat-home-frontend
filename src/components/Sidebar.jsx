import React from 'react'
import './Sidebar.css'

export default function Sidebar({
  sessions,
  currentSession,
  isOpen,
  onClose,
  onSelect,
  onNew,
  onDelete,
  onOpenSettings
}) {
  return (
    <>
      {/* 遮罩层（手机端） */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-emoji">🐱</span>
            <span className="logo-text">Cat's Home</span>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNew}>
          <span className="plus-icon">+</span>
          新对话
        </button>

        <div className="session-list">
          {sessions.length === 0 ? (
            <div className="empty-sessions">还没有对话，点击上方创建吧～</div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                onClick={() => onSelect(session)}
              >
                <span className="session-icon">💬</span>
                <span className="session-name">{session.name || '新对话'}</span>
                <button
                  className="session-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('确定删除这个对话吗？')) {
                      onDelete(session.id)
                    }
                  }}
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="model-badge">
            <span className="model-dot"></span>
            <span className="model-name">DeepSeek-V3</span>
            <span className="model-via">via 硅基流动</span>
          </div>
          <button className="footer-btn" onClick={onOpenSettings}>
            ⚙️ 设置
          </button>
        </div>
      </aside>
    </>
  )
}
