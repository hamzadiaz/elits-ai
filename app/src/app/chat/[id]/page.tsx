'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChatInterface } from '@/components/ChatInterface'
import { ShieldCheck, Brain, ChevronRight } from 'lucide-react'

interface Message {
  role: 'user' | 'elit'
  content: string
}

export default function ChatWithElitPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [elitName, setElitName] = useState('')

  useEffect(() => {
    const prompt = localStorage.getItem('elitSystemPrompt')
    const profile = localStorage.getItem('elitProfile')
    if (prompt) setSystemPrompt(prompt)
    if (profile) {
      try { setElitName(JSON.parse(profile).name) } catch {}
    }
    if (prompt) {
      setMessages([{
        role: 'elit',
        content: `Hey! I'm ${elitName || 'your Elit'} — well, the AI version. Ask me anything and I'll respond just like the real deal. 🧠`,
      }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSend = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setIsLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role === 'elit' ? 'model' : 'user', content: m.content })),
          systemPrompt,
        }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'elit', content: data.response }])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  if (!systemPrompt) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
            <Brain className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-white mb-3">No Elit Trained Yet</h1>
          <p className="text-gray-500 mb-8 text-sm">Create and train your Elit first to chat with it.</p>
          <a href="/create" className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold hover:scale-[1.02] transition-transform">
            Create Elit
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto">
      {/* Verified badge header */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-400/5 border border-green-400/10 w-fit">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400 font-medium">On-chain Verified</span>
          <span className="text-xs text-gray-600">·</span>
          <span className="text-xs text-gray-500">{elitName}&apos;s Elit</span>
        </div>
      </div>

      <div className="flex-1 mx-4 my-2 rounded-2xl overflow-hidden border border-white/[0.04]">
        <ChatInterface
          messages={messages}
          onSend={handleSend}
          isLoading={isLoading}
          title={`${elitName}'s Elit`}
          subtitle="✅ Verified · Personality-driven responses"
          placeholder="Ask anything..."
        />
      </div>
    </div>
  )
}
