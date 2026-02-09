'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Brain } from 'lucide-react'

interface Message { role: 'user' | 'elit'; content: string }

interface ChatInterfaceProps {
  messages: Message[]; onSend: (message: string) => void; isLoading: boolean
  title?: string; subtitle?: string; placeholder?: string
}

export function ChatInterface({ messages, onSend, isLoading, title, subtitle, placeholder }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    onSend(input.trim()); setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-black/40">
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-white/[0.06] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-amber-300/40" />
            </div>
            <div>
              {title && <h2 className="text-[13px] font-medium text-white/60">{title}</h2>}
              {subtitle && <p className="text-[11px] text-white/35 font-light">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] sm:max-w-[70%] ${
                msg.role === 'user'
                  ? 'bg-amber-500/[0.06] border border-amber-500/20 text-white/70'
                  : 'bg-white/[0.04] border border-white/[0.06] text-white/40'
              } rounded-2xl px-4 py-3`}>
                {msg.role === 'elit' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-amber-500/[0.1] flex items-center justify-center">
                      <Brain className="w-2 h-2 text-amber-300/40" />
                    </div>
                    <span className="text-[9px] font-medium text-white/35 uppercase tracking-wider">Elit</span>
                  </div>
                )}
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-light">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-3.5 h-3.5 rounded-md bg-amber-500/[0.1] flex items-center justify-center">
                  <Brain className="w-2 h-2 text-amber-300/40" />
                </div>
                <span className="text-[9px] font-medium text-white/35 uppercase tracking-wider">Thinking</span>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1 h-1 rounded-full bg-amber-500/30"
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 sm:px-6 py-4 border-t border-white/[0.06]">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder={placeholder || 'Type a message...'}
            rows={1}
            className="elite-input flex-1 pr-10"
            style={{ maxHeight: '120px' }}
          />
          <button className="p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/35 hover:text-amber-300/40 hover:border-amber-500/20 transition-all shrink-0 cursor-pointer" title="Voice">
            <Mic className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleSubmit} disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/80 disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
