'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ChatInterface } from '@/components/ChatInterface'
import { AgentAvatar } from '@/components/NFACard'
import { getAgent, isAgentOwned, type NFAAgent } from '@/lib/agents'
import { ShieldCheck, Brain, ChevronRight, Lock, Zap, DollarSign } from 'lucide-react'

interface Message {
  role: 'user' | 'elit'
  content: string
}

export default function AgentChatPage() {
  const params = useParams()
  const router = useRouter()
  const [agent, setAgent] = useState<NFAAgent | null>(null)
  const [owned, setOwned] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isNFAAgent, setIsNFAAgent] = useState(false)

  useEffect(() => {
    const id = params.id as string
    const nfaAgent = getAgent(id)

    if (nfaAgent) {
      setAgent(nfaAgent)
      setIsNFAAgent(true)
      setOwned(isAgentOwned(nfaAgent.id))
      if (isAgentOwned(nfaAgent.id)) {
        setMessages([{
          role: 'elit',
          content: `Hey! I'm ${nfaAgent.name}. ${nfaAgent.description.split('.')[0]}. What can I help you with?`,
        }])
      }
    } else {
      // Fall back to legacy elit chat
      const prompt = localStorage.getItem('elitSystemPrompt')
      const profile = localStorage.getItem('elitProfile')
      if (prompt && profile) {
        try {
          const p = JSON.parse(profile)
          setAgent({
            id: 'legacy',
            name: p.name || 'Your Elit',
            description: p.bio || '',
            category: 'Creative',
            personality: prompt,
            avatarStyle: 'golden-holographic',
            skills: p.skills || [],
            price: 0,
            perUseFee: 0,
            creator: '',
            rating: 0,
            usageCount: 0,
            revenueGenerated: 0,
            rarity: 'common',
            ownerCount: 1,
          })
          setOwned(true)
          setMessages([{
            role: 'elit',
            content: `Hey! I'm ${p.name || 'your Elit'} — the AI version. Ask me anything! 🧠`,
          }])
        } catch {}
      }
    }
  }, [params.id])

  const handleSend = async (content: string) => {
    if (!agent) return
    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setIsLoading(true)
    try {
      const systemPrompt = isNFAAgent ? agent.personality : (localStorage.getItem('elitSystemPrompt') || '')
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
    } catch (err) {
      console.error(err)
      setMessages([...newMessages, { role: 'elit', content: 'Sorry, I had trouble generating a response.' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Not owned gate
  if (isNFAAgent && !owned) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/[0.06] border border-red-500/15 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-red-400/40" />
          </div>
          <h1 className="text-2xl font-bold gradient-text-white mb-3">Agent Locked</h1>
          <p className="text-white/40 mb-2 text-[13px] font-light">You don&apos;t own this NFA yet.</p>
          {agent && (
            <p className="text-white/25 mb-8 text-[12px]">Purchase <strong className="text-white/50">{agent.name}</strong> for {agent.price} SOL to start chatting.</p>
          )}
          <button
            onClick={() => router.push(`/agent/${params.id}`)}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 opacity-50" />
            View & Buy Agent
            <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-all" />
          </button>
        </motion.div>
      </div>
    )
  }

  // No agent at all
  if (!agent) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mx-auto mb-8">
            <Brain className="w-7 h-7 text-amber-300/40" />
          </div>
          <h1 className="text-2xl font-bold gradient-text-white mb-3">No Agent Found</h1>
          <p className="text-white/40 mb-8 text-[13px] font-light">Browse the marketplace to find an agent.</p>
          <a href="/explore" className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-transform">
            Explore NFAs
            <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-all" />
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <AgentAvatar agent={agent} size="sm" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{agent.name}</span>
              {isNFAAgent && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/[0.06] border border-emerald-400/[0.1]">
                  <ShieldCheck className="w-3 h-3 text-emerald-400/60" />
                  <span className="text-[10px] text-emerald-400/60 font-medium">NFA Verified</span>
                </span>
              )}
            </div>
            {isNFAAgent && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white/20">{agent.category}</span>
                <span className="text-[10px] text-white/15">·</span>
                <span className="flex items-center gap-0.5 text-[10px] text-amber-400/30">
                  <DollarSign className="w-2.5 h-2.5" />
                  {agent.perUseFee} SOL/msg
                </span>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2 ml-12">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <div className="w-1.5 h-1.5 bg-primary-light/60 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary-light/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <div className="w-1.5 h-1.5 bg-primary-light/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="text-[10px] text-white/25 ml-1">{agent.name} is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 mx-4 my-2 rounded-2xl overflow-hidden border border-white/[0.08]">
        <ChatInterface
          messages={messages}
          onSend={handleSend}
          isLoading={isLoading}
          title={agent.name}
          subtitle={isNFAAgent ? `${agent.category} · ${agent.perUseFee} SOL per message` : '✅ Verified · Personality-driven responses'}
          placeholder={`Ask ${agent.name} anything...`}
        />
      </div>
    </div>
  )
}
