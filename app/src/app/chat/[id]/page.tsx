'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChatInterface } from '@/components/ChatInterface'
import { Avatar3D } from '@/components/Avatar3D'
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const prompt = localStorage.getItem('elitSystemPrompt')
    const profile = localStorage.getItem('elitProfile')
    if (prompt) setSystemPrompt(prompt)
    if (profile) {
      try {
        const p = JSON.parse(profile)
        setElitName(p.name)
        setAvatarUrl(p.avatarUrl || null)
      } catch {}
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
      {/* Header with avatar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <Avatar3D avatarUrl={avatarUrl} name={elitName || '?'} size="sm" state={isLoading ? 'thinking' : 'idle'} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{elitName}&apos;s Elit</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20">
              <ShieldCheck className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-green-400 font-medium">Verified</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">Personality-driven responses</p>
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
