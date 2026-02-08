'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChatInterface } from '@/components/ChatInterface'

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
          messages: newMessages.map(m => ({
            role: m.role === 'elit' ? 'model' : 'user',
            content: m.content,
          })),
          systemPrompt,
        }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'elit', content: data.response }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!systemPrompt) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-6xl mb-6">💬</div>
          <h1 className="text-3xl font-bold text-white mb-4">No Elit Trained Yet</h1>
          <p className="text-gray-400 mb-8">Create and train your Elit first to chat with it.</p>
          <a href="/create" className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold">
            Create Elit →
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto">
      <div className="flex-1 glass mx-4 my-4 rounded-2xl overflow-hidden flex flex-col">
        <ChatInterface
          messages={messages}
          onSend={handleSend}
          isLoading={isLoading}
          title={`Chat with ${elitName}'s Elit`}
          subtitle="✅ On-chain verified · Personality-driven responses"
          placeholder="Ask anything..."
        />
      </div>
    </div>
  )
}
