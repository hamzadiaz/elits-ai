'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    <div className="flex flex-col h-full">
      {/* Header */}
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/5">
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] sm:max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-primary/20 border border-primary/30 text-white'
                  : 'glass text-gray-200'
              } rounded-2xl px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400">
                    {msg.role === 'user' ? 'You' : '🧠 Elit'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">🧠 Elit</span>
              </div>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-white/5">
        <div className="flex gap-3 items-end">
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
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors resize-none text-sm"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium disabled:opacity-50 hover:scale-105 transition-transform shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
