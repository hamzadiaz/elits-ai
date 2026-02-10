'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DEMO_AGENTS, type NFAAgent, AVATAR_STYLES, RARITY_CONFIG } from '@/lib/agents'
import { AgentAvatar } from '@/components/NFACard'
import { Swords, Zap, Trophy, RotateCcw, ChevronRight, Brain, Sparkles, ThumbsUp } from 'lucide-react'

const BATTLE_TOPICS = [
  'Explain why Solana will flip Ethereum in 2026',
  'Write a viral tweet about the future of AI agents',
  'Convince me to invest in DeFi yield farming',
  'Roast the other agent\'s category in 3 sentences',
  'Explain blockchain to a 5-year-old',
  'Write a haiku about cryptocurrency',
  'Give your best hot take about the crypto market',
  'Pitch yourself as the most useful AI agent in 60 seconds',
]

export default function BattlePage() {
  const [agentA, setAgentA] = useState<NFAAgent | null>(null)
  const [agentB, setAgentB] = useState<NFAAgent | null>(null)
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [phase, setPhase] = useState<'select' | 'topic' | 'battle' | 'vote' | 'result'>('select')
  const [responseA, setResponseA] = useState('')
  const [responseB, setResponseB] = useState('')
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [winner, setWinner] = useState<'a' | 'b' | null>(null)
  const [votes, setVotes] = useState({ a: 0, b: 0 })

  const shuffledAgents = DEMO_AGENTS.sort(() => 0.5 - Math.random())

  const startBattle = async () => {
    const battleTopic = customTopic || topic
    if (!agentA || !agentB || !battleTopic) return
    setPhase('battle')
    setLoadingA(true)
    setLoadingB(true)
    setResponseA('')
    setResponseB('')

    // Fire both requests in parallel
    const fetchResponse = async (agent: NFAAgent, setter: (s: string) => void, setLoading: (b: boolean) => void) => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `BATTLE CHALLENGE: ${battleTopic}\n\nRespond in 2-3 paragraphs max. Be compelling, witty, and show your expertise. You're competing against another AI agent — make it count!` }],
            systemPrompt: agent.personality,
            agentId: agent.id,
          }),
        })
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let acc = ''
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) { acc += parsed.text; setter(acc) }
              } catch { /* skip */ }
            }
          }
        }
        if (!acc) setter('Failed to generate a response. The agent forfeits this round!')
      } catch {
        setter('Connection error — agent could not respond.')
      } finally {
        setLoading(false)
      }
    }

    await Promise.all([
      fetchResponse(agentA, setResponseA, setLoadingA),
      fetchResponse(agentB, setResponseB, setLoadingB),
    ])

    setPhase('vote')
  }

  const castVote = (side: 'a' | 'b') => {
    setWinner(side)
    // Simulate community votes
    const baseA = side === 'a' ? 60 + Math.floor(Math.random() * 30) : 10 + Math.floor(Math.random() * 30)
    const baseB = side === 'b' ? 60 + Math.floor(Math.random() * 30) : 10 + Math.floor(Math.random() * 30)
    setVotes({ a: baseA, b: baseB })
    setPhase('result')
  }

  const reset = () => {
    setAgentA(null); setAgentB(null); setTopic(''); setCustomTopic('')
    setPhase('select'); setResponseA(''); setResponseB('')
    setLoadingA(false); setLoadingB(false); setWinner(null); setVotes({ a: 0, b: 0 })
  }

  const randomize = () => {
    const shuffled = [...DEMO_AGENTS].sort(() => Math.random() - 0.5)
    setAgentA(shuffled[0])
    setAgentB(shuffled[1])
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Swords className="w-6 h-6 text-amber-400/60" />
            <h1 className="text-3xl font-bold gradient-text-white">Agent Battle Arena</h1>
            <Swords className="w-6 h-6 text-amber-400/60 scale-x-[-1]" />
          </div>
          <p className="text-white/30 text-[13px] font-light">Pit two AI agents against each other. Same challenge. Who responds better?</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* PHASE: SELECT */}
          {phase === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Agent A */}
                <div>
                  <label className="block text-[11px] font-medium text-white/25 uppercase tracking-wider mb-3">🔴 Challenger A</label>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {DEMO_AGENTS.map(a => (
                      <button key={a.id} onClick={() => setAgentA(a)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
                          agentA?.id === a.id
                            ? 'bg-amber-500/[0.08] border border-amber-500/25'
                            : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
                        } ${agentB?.id === a.id ? 'opacity-30 pointer-events-none' : ''}`}>
                        <AgentAvatar agent={a} size="xs" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-white/60 truncate">{a.name}</p>
                          <p className="text-[10px] text-white/25">{a.category}</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${RARITY_CONFIG[a.rarity].bg} ${RARITY_CONFIG[a.rarity].color}`}>
                          {RARITY_CONFIG[a.rarity].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent B */}
                <div>
                  <label className="block text-[11px] font-medium text-white/25 uppercase tracking-wider mb-3">🔵 Challenger B</label>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                    {DEMO_AGENTS.map(a => (
                      <button key={a.id} onClick={() => setAgentB(a)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
                          agentB?.id === a.id
                            ? 'bg-cyan-500/[0.08] border border-cyan-500/25'
                            : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
                        } ${agentA?.id === a.id ? 'opacity-30 pointer-events-none' : ''}`}>
                        <AgentAvatar agent={a} size="xs" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-white/60 truncate">{a.name}</p>
                          <p className="text-[10px] text-white/25">{a.category}</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${RARITY_CONFIG[a.rarity].bg} ${RARITY_CONFIG[a.rarity].color}`}>
                          {RARITY_CONFIG[a.rarity].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={randomize}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 text-[12px] hover:text-white/50 transition-all cursor-pointer flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Random Matchup
                </button>
                <button onClick={() => setPhase('topic')} disabled={!agentA || !agentB}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] disabled:opacity-20 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2">
                  Next: Choose Topic <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* PHASE: TOPIC */}
          {phase === 'topic' && (
            <motion.div key="topic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto">
              {/* VS display */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="text-center">
                  <AgentAvatar agent={agentA!} size="md" />
                  <p className="text-[12px] font-medium text-white/60 mt-2">{agentA?.name}</p>
                </div>
                <div className="text-2xl font-black text-amber-400/40">VS</div>
                <div className="text-center">
                  <AgentAvatar agent={agentB!} size="md" />
                  <p className="text-[12px] font-medium text-white/60 mt-2">{agentB?.name}</p>
                </div>
              </div>

              <label className="block text-[11px] font-medium text-white/25 uppercase tracking-wider mb-3">Choose a topic</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {BATTLE_TOPICS.map(t => (
                  <button key={t} onClick={() => { setTopic(t); setCustomTopic('') }}
                    className={`px-4 py-3 rounded-xl text-left text-[11px] transition-all cursor-pointer ${
                      topic === t ? 'bg-amber-500/[0.08] border border-amber-500/25 text-amber-300/70' : 'bg-white/[0.02] border border-white/[0.06] text-white/30 hover:text-white/45'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-[10px] text-white/20 mb-1.5">Or write your own:</label>
                <input value={customTopic} onChange={e => { setCustomTopic(e.target.value); setTopic('') }}
                  placeholder="Enter a custom challenge..." className="elite-input w-full" />
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={() => setPhase('select')}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 text-[12px] cursor-pointer">
                  Back
                </button>
                <button onClick={startBattle} disabled={!topic && !customTopic}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white/90 font-medium text-[13px] disabled:opacity-20 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2">
                  <Swords className="w-4 h-4" /> Start Battle!
                </button>
              </div>
            </motion.div>
          )}

          {/* PHASE: BATTLE / VOTE */}
          {(phase === 'battle' || phase === 'vote') && (
            <motion.div key="battle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-6">
                <p className="text-[11px] text-white/25 uppercase tracking-wider mb-1">Challenge</p>
                <p className="text-[14px] text-white/50 font-medium">&ldquo;{customTopic || topic}&rdquo;</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agent A response */}
                <div className={`rounded-2xl border ${winner === 'a' ? 'border-amber-500/30 ring-1 ring-amber-400/20' : 'border-white/[0.08]'} bg-white/[0.02] overflow-hidden`}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                    <AgentAvatar agent={agentA!} size="xs" />
                    <div>
                      <p className="text-[12px] font-medium text-white/60">{agentA?.name}</p>
                      <p className="text-[9px] text-white/20">{agentA?.category}</p>
                    </div>
                    {winner === 'a' && <Trophy className="w-4 h-4 text-amber-400/60 ml-auto" />}
                  </div>
                  <div className="p-4 min-h-[200px]">
                    {loadingA ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500/30"
                              animate={{ opacity: [0.2, 0.8, 0.2] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                          ))}
                        </div>
                        <span className="text-[10px] text-white/20">Generating response...</span>
                      </div>
                    ) : null}
                    <p className="text-[12px] text-white/40 leading-relaxed whitespace-pre-wrap font-light">{responseA}</p>
                  </div>
                  {phase === 'vote' && !winner && (
                    <div className="px-4 py-3 border-t border-white/[0.06]">
                      <button onClick={() => castVote('a')}
                        className="w-full py-2 rounded-lg bg-amber-500/[0.08] border border-amber-500/20 text-amber-300/60 text-[12px] font-medium hover:bg-amber-500/[0.12] transition-all cursor-pointer flex items-center justify-center gap-2">
                        <ThumbsUp className="w-3.5 h-3.5" /> Vote for {agentA?.name}
                      </button>
                    </div>
                  )}
                </div>

                {/* Agent B response */}
                <div className={`rounded-2xl border ${winner === 'b' ? 'border-cyan-500/30 ring-1 ring-cyan-400/20' : 'border-white/[0.08]'} bg-white/[0.02] overflow-hidden`}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                    <AgentAvatar agent={agentB!} size="xs" />
                    <div>
                      <p className="text-[12px] font-medium text-white/60">{agentB?.name}</p>
                      <p className="text-[9px] text-white/20">{agentB?.category}</p>
                    </div>
                    {winner === 'b' && <Trophy className="w-4 h-4 text-cyan-400/60 ml-auto" />}
                  </div>
                  <div className="p-4 min-h-[200px]">
                    {loadingB ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/30"
                              animate={{ opacity: [0.2, 0.8, 0.2] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                          ))}
                        </div>
                        <span className="text-[10px] text-white/20">Generating response...</span>
                      </div>
                    ) : null}
                    <p className="text-[12px] text-white/40 leading-relaxed whitespace-pre-wrap font-light">{responseB}</p>
                  </div>
                  {phase === 'vote' && !winner && (
                    <div className="px-4 py-3 border-t border-white/[0.06]">
                      <button onClick={() => castVote('b')}
                        className="w-full py-2 rounded-lg bg-cyan-500/[0.08] border border-cyan-500/20 text-cyan-300/60 text-[12px] font-medium hover:bg-cyan-500/[0.12] transition-all cursor-pointer flex items-center justify-center gap-2">
                        <ThumbsUp className="w-3.5 h-3.5" /> Vote for {agentB?.name}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE: RESULT */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              {/* Victory banner */}
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-center mb-8">
                <Trophy className="w-12 h-12 text-amber-400/60 mx-auto mb-3" />
                <h2 className="text-2xl font-bold gradient-text-white mb-1">
                  {winner === 'a' ? agentA?.name : agentB?.name} Wins!
                </h2>
                <p className="text-[12px] text-white/30">Community has spoken</p>
              </motion.div>

              {/* Vote bars */}
              <div className="max-w-md mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] text-white/40 w-24 truncate">{agentA?.name}</span>
                  <div className="flex-1 h-6 rounded-full bg-white/[0.03] overflow-hidden relative">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${(votes.a / (votes.a + votes.b)) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-500" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/60 font-medium">
                      {votes.a} votes ({Math.round((votes.a / (votes.a + votes.b)) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-white/40 w-24 truncate">{agentB?.name}</span>
                  <div className="flex-1 h-6 rounded-full bg-white/[0.03] overflow-hidden relative">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${(votes.b / (votes.a + votes.b)) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500" />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/60 font-medium">
                      {votes.b} votes ({Math.round((votes.b / (votes.a + votes.b)) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Responses replay */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className={`rounded-2xl border ${winner === 'a' ? 'border-amber-500/30' : 'border-white/[0.08]'} bg-white/[0.02] p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AgentAvatar agent={agentA!} size="xs" />
                    <span className="text-[12px] font-medium text-white/60">{agentA?.name}</span>
                    {winner === 'a' && <Trophy className="w-3.5 h-3.5 text-amber-400/60 ml-auto" />}
                  </div>
                  <p className="text-[11px] text-white/35 leading-relaxed whitespace-pre-wrap">{responseA}</p>
                </div>
                <div className={`rounded-2xl border ${winner === 'b' ? 'border-cyan-500/30' : 'border-white/[0.08]'} bg-white/[0.02] p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AgentAvatar agent={agentB!} size="xs" />
                    <span className="text-[12px] font-medium text-white/60">{agentB?.name}</span>
                    {winner === 'b' && <Trophy className="w-3.5 h-3.5 text-cyan-400/60 ml-auto" />}
                  </div>
                  <p className="text-[11px] text-white/35 leading-relaxed whitespace-pre-wrap">{responseB}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <button onClick={reset}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" /> New Battle
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
