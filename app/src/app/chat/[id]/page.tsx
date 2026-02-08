'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatInterface } from '@/components/ChatInterface'
import { Avatar3D } from '@/components/Avatar3D'
import { ShieldCheck, Brain, ChevronRight, AlertTriangle, Twitter, Code, MessageSquare, Search, X } from 'lucide-react'

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
  const [showDispute, setShowDispute] = useState(false)
  const [disputeSent, setDisputeSent] = useState(false)

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

  const handleDispute = () => {
    setDisputeSent(true)
    setTimeout(() => { setShowDispute(false); setDisputeSent(false) }, 3000)
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
      {/* Enhanced header */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <Avatar3D avatarUrl={avatarUrl} name={elitName || '?'} size="sm" state={isLoading ? 'thinking' : 'idle'} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{elitName}&apos;s Elit</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20">
                <ShieldCheck className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-medium">On-chain verified</span>
              </div>
            </div>
            {/* Delegation scopes */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-gray-600">Can:</span>
              {[
                { icon: MessageSquare, label: 'Chat' },
                { icon: Twitter, label: 'Post' },
                { icon: Code, label: 'Code' },
                { icon: Search, label: 'Research' },
              ].map(scope => (
                <span key={scope.label} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
                  <scope.icon className="w-2.5 h-2.5 text-gray-500" />
                  <span className="text-[9px] text-gray-500">{scope.label}</span>
                </span>
              ))}
            </div>
          </div>
          {/* Dispute button */}
          <button
            onClick={() => setShowDispute(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500/5 border border-orange-500/15 text-orange-400/70 hover:bg-orange-500/10 transition-colors"
            title="Report if this Elit isn't representing you correctly"
          >
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[10px] font-medium hidden sm:inline">Dispute</span>
          </button>
        </div>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-2 ml-12"
          >
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.04]">
              <div className="w-1.5 h-1.5 bg-primary-light/60 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary-light/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-1.5 h-1.5 bg-primary-light/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="text-[10px] text-gray-600 ml-1">{elitName} is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dispute modal */}
      <AnimatePresence>
        {showDispute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => !disputeSent && setShowDispute(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[#0a0a0f] border border-white/[0.08] p-6"
            >
              {disputeSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-sm text-white font-semibold mb-1">Dispute Filed</p>
                  <p className="text-xs text-gray-500">The owner has been notified. This will be reviewed on-chain.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <h3 className="text-sm font-semibold text-white">This isn&apos;t me</h3>
                    </div>
                    <button onClick={() => setShowDispute(false)} className="text-gray-600 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    If you are the real {elitName} and this Elit is not accurately representing you, file a dispute.
                    This will trigger an on-chain review process.
                  </p>
                  <button
                    onClick={handleDispute}
                    className="w-full py-3 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/25 text-sm font-semibold hover:bg-orange-500/25 transition-colors"
                  >
                    File Dispute
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
