import React, { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import SettingsModal from './components/SettingsModal'
import * as api from './utils/api'
import './App.css'

export default function App() {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState(null)
  const [currentModel, setCurrentModel] = useState(null)
  const messagesEndRef = useRef(null)

  // 加载会话列表
  const loadSessions = useCallback(async () => {
    try {
      const data = await api.fetchSessions()
      setSessions(data)
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0])
      }
    } catch (err) {
      setError('加载会话失败: ' + err.message)
    }
  }, [currentSession])

  // 加载设置
  const loadSettings = useCallback(async () => {
    try {
      const data = await api.fetchSettings()
      setSettings(data)
    } catch (err) {
      console.error('加载设置失败:', err)
    }
  }, [])

  useEffect(() => {
    loadSessions()
    loadSettings()
  }, [])

  // 切换会话时加载消息
  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id)
    }
  }, [currentSession])

  const loadMessages = async (sessionId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchMessages(sessionId)
      setMessages(data)
    } catch (err) {
      setError('加载消息失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (text) => {
    if (!currentSession || !text.trim() || sending) return

    // 先在界面上显示用户消息
    const userMsg = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    setSending(true)
    setError(null)

    // 先放一个空的 AI 消息，用于流式追加
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      reasoning_content: '',
      isStreaming: true,
      created_at: new Date().toISOString()
    }])

    try {
      await api.sendMessageStream(
        currentSession.id,
        text,
        {
          onText: (chunk) => {
            setMessages(prev => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last && last.role === 'assistant' && last.isStreaming) {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + chunk
                }
              }
              return updated
            })
          },
          onReasoning: (chunk) => {
            setMessages(prev => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last && last.role === 'assistant' && last.isStreaming) {
                updated[updated.length - 1] = {
                  ...last,
                  reasoning_content: (last.reasoning_content || '') + chunk
                }
              }
              return updated
            })
          },
          onDone: ({ model, compressed }) => {
            if (model) setCurrentModel(model)
            setMessages(prev => prev.map(msg =>
              msg.isStreaming ? { ...msg, isStreaming: false } : msg
            ))
          },
          onError: (errMsg) => {
            setMessages(prev => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last && last.role === 'assistant' && last.isStreaming) {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content || `（出错了：${errMsg}）`,
                  isStreaming: false
                }
              }
              return updated
            })
          }
        }
      )
    } catch (err) {
      setError('发送消息失败: ' + err.message)
      // 移除用户消息和空的 AI 消息
      setMessages(prev => prev.slice(0, -2))
    } finally {
      setSending(false)
    }
  }

  const handleNewSession = async () => {
    try {
      const newSession = await api.createSession()
      setSessions(prev => [newSession, ...prev])
      setCurrentSession(newSession)
      setMessages([])
      setSidebarOpen(false)
    } catch (err) {
      setError('创建会话失败: ' + err.message)
    }
  }

  const handleDeleteSession = async (id) => {
    try {
      await api.deleteSession(id)
      const updated = sessions.filter(s => s.id !== id)
      setSessions(updated)
      if (currentSession?.id === id) {
        setCurrentSession(updated[0] || null)
        setMessages([])
      }
    } catch (err) {
      setError('删除会话失败: ' + err.message)
    }
  }

  const handleSelectSession = (session) => {
    setCurrentSession(session)
    setSidebarOpen(false)
  }

  const handleSaveSettings = async (updates) => {
    try {
      const data = await api.updateSettings(updates)
      setSettings(data)
      setSettingsOpen(false)
    } catch (err) {
      setError('保存设置失败: ' + err.message)
    }
  }

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
        onOpenSettings={() => setSettingsOpen(true)}
        currentModel={currentModel}
      />

      <ChatWindow
        messages={messages}
        loading={loading}
        sending={sending}
        error={error}
        currentSession={currentSession}
        onSend={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewSession={handleNewSession}
        messagesEndRef={messagesEndRef}
      />

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
