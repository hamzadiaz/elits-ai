'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Brain } from 'lucide-react'

interface Message {
  role: 'user' | 'elit'
  content: string
}

interface ChatInterfaceProps {
  messages: Message[]
  onSend: (message: string) => void
  isLoading: boolean
  title?: string
  subtitle?: string
  placeholder?: string
}

export function ChatInterface({ messages, onSend, isLoading, title, subtitle, placeholder }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-black/40">
      {/* Header */}
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/[0.04] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue/20 border border-white/[0.06] flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-light" />
            </div>
            <div>
              {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
              {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] sm:max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-primary/15 to-blue/10 border border-primary/20 text-white'
                  : 'bg-white/[0.03] border border-white/[0.06] text-gray-300 shadow-[0_0_30px_rgba(124,58,237,0.04)]'
              } rounded-2xl px-4 py-3`}>
                {msg.role === 'elit' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-4 h-4 rounded-md bg-gradient-to-br from-primary/30 to-blue/30 flex items-center justify-center">
                      <Brain className="w-2.5 h-2.5 text-primary-light" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">Elit</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 shadow-[0_0_30px_rgba(124,58,237,0.04)]">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-primary/30 to-blue/30 flex items-center justify-center">
                  <Brain className="w-2.5 h-2.5 text-primary-light" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">Thinking</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/40"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-white/[0.04]">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder={placeholder || 'Type a message...'}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-primary/30 focus:shadow-[0_0_20px_rgba(124,58,237,0.06)] transition-all resize-none text-sm"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-gray-500 hover:text-primary-light hover:border-primary/30 transition-all shrink-0"
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
