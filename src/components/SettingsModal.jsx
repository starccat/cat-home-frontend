import React, { useState, useEffect } from 'react'
import './SettingsModal.css'
import '../App.css'

export default function SettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({
    system_prompt: '',
    temperature: 0.7,
    max_context_rounds: 10,
    max_context_tokens: 8000,
    compress_threshold: 6000,
    compress_keep_rounds: 4,
    max_reply_tokens: 2000
  })

  useEffect(() => {
    if (settings) {
      setForm({
        system_prompt: settings.system_prompt || '',
        temperature: settings.temperature ?? 0.7,
        max_context_rounds: settings.max_context_rounds ?? 10,
        max_context_tokens: settings.max_context_tokens ?? 8000,
        compress_threshold: settings.compress_threshold ?? 6000,
        compress_keep_rounds: settings.compress_keep_rounds ?? 4,
        max_reply_tokens: settings.max_reply_tokens ?? 2000
      })
    }
  }, [settings])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ 设置</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>系统提示词（AI 的人设）</label>
            <textarea
              value={form.system_prompt}
              onChange={e => handleChange('system_prompt', e.target.value)}
              rows={4}
              placeholder="描述你希望 AI 扮演的角色..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>温度（创造力）: {form.temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={form.temperature}
                onChange={e => handleChange('temperature', parseFloat(e.target.value))}
              />
              <div className="range-labels">
                <span>理性</span>
                <span>创意</span>
              </div>
            </div>

            <div className="form-group">
              <label>最大回复字数</label>
              <input
                type="number"
                value={form.max_reply_tokens}
                onChange={e => handleChange('max_reply_tokens', parseInt(e.target.value))}
                min="100"
                max="8000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>上下文轮数</label>
              <input
                type="number"
                value={form.max_context_rounds}
                onChange={e => handleChange('max_context_rounds', parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>

            <div className="form-group">
              <label>上下文 Token 上限</label>
              <input
                type="number"
                value={form.max_context_tokens}
                onChange={e => handleChange('max_context_tokens', parseInt(e.target.value))}
                min="1000"
                max="32000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>压缩阈值</label>
              <input
                type="number"
                value={form.compress_threshold}
                onChange={e => handleChange('compress_threshold', parseInt(e.target.value))}
                min="1000"
                max="32000"
              />
            </div>

            <div className="form-group">
              <label>压缩后保留轮数</label>
              <input
                type="number"
                value={form.compress_keep_rounds}
                onChange={e => handleChange('compress_keep_rounds', parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>取消</button>
            <button type="submit" className="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
  )
}
