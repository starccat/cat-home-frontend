// 后端 API 地址
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/sessions`)
  if (!res.ok) throw new Error('Failed to fetch sessions')
  return res.json()
}

export async function createSession(name = '新对话') {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  if (!res.ok) throw new Error('Failed to create session')
  return res.json()
}

export async function deleteSession(id) {
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete session')
  return res.json()
}

export async function renameSession(id, name) {
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  if (!res.ok) throw new Error('Failed to rename session')
  return res.json()
}

export async function fetchMessages(sessionId) {
  const res = await fetch(`${API_BASE}/messages/${sessionId}`)
  if (!res.ok) throw new Error('Failed to fetch messages')
  return res.json()
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`)
  if (!res.ok) throw new Error('Failed to fetch settings')
  return res.json()
}

export async function updateSettings(updates) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  if (!res.ok) throw new Error('Failed to update settings')
  return res.json()
}

export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message })
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

/**
 * 流式发送消息
 * @param {number} sessionId - 会话 ID
 * @param {string} message - 用户消息
 * @param {function} onText - 收到正文片段时的回调 (text) => void
 * @param {function} onReasoning - 收到思考过程片段时的回调 (text) => void
 * @param {function} onDone - 流结束时回调 ({ model, compressed }) => void
 * @param {function} onError - 出错时回调 (errMsg) => void
 */
export async function sendMessageStream(sessionId, message, { onText, onReasoning, onDone, onError }) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, stream: true })
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let sseBuffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    sseBuffer += decoder.decode(value, { stream: true })
    const lines = sseBuffer.split('\n')
    sseBuffer = lines.pop() // 保留最后一个不完整的行

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const jsonStr = line.slice(6)
      if (!jsonStr.trim()) continue

      try {
        const event = JSON.parse(jsonStr)

        if (event.type === 'text' && onText) {
          onText(event.content)
        }
        if (event.type === 'reasoning' && onReasoning) {
          onReasoning(event.content)
        }
        if (event.type === 'error' && onError) {
          onError(event.content)
        }
        if (event.type === 'done' && onDone) {
          onDone({ model: event.model, compressed: event.compressed })
        }
      } catch (e) {
        // 忽略坏片段
      }
    }
  }
}
