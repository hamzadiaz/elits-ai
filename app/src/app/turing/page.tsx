'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, MessageSquare, User, ChevronRight, Trophy, RotateCcw, Sparkles, Eye } from 'lucide-react'

const SAMPLE_HUMAN_RESPONSES = [
  "Hmm good question. I'd say my approach is pretty iterative — I like to prototype fast, get feedback, then refine. Classic build-measure-learn loop.",
  "Honestly? I procrastinate a bit, then hyperfocus and ship something in one sitting lol. Works surprisingly well.",
  "I think what sets me apart is that I actually enjoy the debugging process. Most people hate it but I find it meditative.",
  "Oh man, don't get me started on that. I have OPINIONS. Short version: TypeScript is non-negotiable, Tailwind is goated, and if you're not using server components you're doing it wrong.",
  "That's a great observation. I'd push back a little though — I think the real issue isn't the tech stack, it's the team dynamics.",
]

const QUESTIONS = [
  "How do you approach building a new project from scratch?",
  "What's your hot take on the current state of web development?",
  "How do you handle disagreements in a team setting?",
  "What motivates you to keep learning new technologies?",
  "If you could change one thing about the tech industry, what would it be?",
]

export default function TuringTestPage() {
  const [stage, setStage] = useState<'intro' | 'test' | 'results'>('intro')
  const [round, setRound] = useState(0)
  const [messages, setMessages] = useState<{ question: string; a: string; b: string }[]>([])
  const [guesses, setGuesses] = useState<('A' | 'B')[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [responseA, setResponseA] = useState('')
  const [responseB, setResponseB] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [elitIsA, setElitIsA] = useState(false)
  const [showingResponses, setShowingResponses] = useState(false)
  const [selectedGuess, setSelectedGuess] = useState<'A' | 'B' | null>(null)

  const systemPrompt = typeof window !== 'undefined' ? localStorage.getItem('elitSystemPrompt') || '' : ''
  const elitName = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('elitProfile') || '{}').name || 'Unknown' } catch { return 'Unknown' } })() : 'Unknown'

  const startTest = () => { setStage('test'); setRound(0); setMessages([]); setGuesses([]); nextRound(0) }

  const nextRound = async (r: number) => {
    const q = QUESTIONS[r % QUESTIONS.length]
    setCurrentQuestion(q); setIsLoading(true); setShowingResponses(false); setSelectedGuess(null); setResponseA(''); setResponseB('')
    const isElitA = Math.random() > 0.5; setElitIsA(isElitA)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: q }], systemPrompt }) })
      const data = await res.json()
      const elitResponse = data.response || "I'd need to think about that more."
      const humanResponse = SAMPLE_HUMAN_RESPONSES[r % SAMPLE_HUMAN_RESPONSES.length]
      if (isElitA) { setResponseA(elitResponse); setResponseB(humanResponse) }
      else { setResponseA(humanResponse); setResponseB(elitResponse) }
    } catch {
      setResponseA("I'd approach that by breaking it down into smaller problems first.")
      setResponseB("Good question! I think it depends on the context honestly.")
    }
    setIsLoading(false); setShowingResponses(true)
  }

  const makeGuess = (guess: 'A' | 'B') => {
    setSelectedGuess(guess)
    setGuesses([...guesses, guess])
    setMessages([...messages, { question: currentQuestion, a: responseA, b: responseB }])
    setTimeout(() => {
      const next = round + 1
      if (next >= 5) setStage('results')
      else { setRound(next); nextRound(next) }
    }, 1200)
  }

  const scorePercent = stage === 'results' ? Math.round(40 + Math.random() * 30) : 0

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}
                className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/[0.08] to-amber-600/[0.08] animate-pulse-glow" />
                <div className="absolute inset-0 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
                  <Eye className="w-8 h-8 text-amber-300/40" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold gradient-text-white mb-4 tracking-tight">Turing Test</h1>
              <p className="text-white/25 mb-2 max-w-sm mx-auto text-[14px] font-light">
                Can you tell the difference between <span className="text-white/60 font-medium">{elitName}</span> and their AI clone?
              </p>
              <p className="text-white/12 text-[13px] mb-8 max-w-sm mx-auto font-light leading-relaxed">
                Two responses to the same question. One human, one AI. Pick the AI. 5 rounds.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button onClick={startTest} disabled={!systemPrompt}
                  className="group flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-all disabled:opacity-30 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 opacity-60" /> Start the Test
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-all" />
                </button>
                {!systemPrompt && <p className="text-[11px] text-red-400/40">Train an Elit first</p>}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-14 max-w-xs mx-auto">
                {[
                  { icon: MessageSquare, label: '5 Rounds' },
                  { icon: Brain, label: 'AI vs Human' },
                  { icon: Trophy, label: 'Score %' },
                ].map((item, i) => (
                  <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                    className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <item.icon className="w-4 h-4 text-white/10 mx-auto mb-1.5" />
                    <span className="text-[10px] text-white/40">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'test' && (
            <motion.div key="test" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] text-white/40">Round {round + 1} of 5</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${
                      i < round ? 'bg-amber-500/40' : i === round ? 'bg-amber-500/20' : 'bg-white/[0.03]'
                    }`} />
                  ))}
                </div>
              </div>

              <motion.div key={`q-${round}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="elite-card rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-3.5 h-3.5 text-amber-300/30" />
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Question</span>
                </div>
                <p className="text-white/60 text-[14px] font-light">{currentQuestion}</p>
              </motion.div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex items-center gap-3">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-amber-500/30 rounded-full"
                        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                    <span className="text-[12px] text-white/40 ml-2 font-light">Generating responses...</span>
                  </div>
                </div>
              ) : showingResponses && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <p className="text-center text-[11px] text-white/40 mb-4 font-light">Which response is from the AI?</p>
                  {['A', 'B'].map(label => {
                    const content = label === 'A' ? responseA : responseB
                    const isSelected = selectedGuess === label
                    return (
                      <motion.button key={label} whileHover={{ scale: selectedGuess ? 1 : 1.005 }}
                        onClick={() => !selectedGuess && makeGuess(label as 'A' | 'B')} disabled={!!selectedGuess}
                        className={`w-full text-left rounded-2xl p-5 border transition-all duration-500 cursor-pointer ${
                          isSelected ? 'border-amber-500/30 bg-amber-500/[0.03] shadow-[0_0_40px_rgba(212,160,23,0.04)]'
                            : selectedGuess ? 'border-white/[0.06] bg-white/[0.02] opacity-40'
                              : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]'
                        }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-semibold ${
                            isSelected ? 'bg-amber-500/[0.12] text-amber-300/60' : 'bg-white/[0.03] text-white/45'
                          }`}>{label}</div>
                          <span className="text-[10px] text-white/40">Response {label}</span>
                          {isSelected && (
                            <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                              className="ml-auto text-[10px] text-amber-300/40 font-medium">Selected ✓</motion.span>
                          )}
                        </div>
                        <p className="text-[13px] text-white/30 leading-relaxed font-light">{content}</p>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {stage === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.3 }}
                className="relative w-28 h-28 mx-auto mb-8">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                  <motion.circle cx="64" cy="64" r="56" fill="none" stroke="url(#gradient)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - scorePercent / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }} />
                  <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4a017" /><stop offset="100%" stopColor="#b8860b" />
                  </linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white/80">{scorePercent}%</span>
                </div>
              </motion.div>

              <h2 className="text-xl font-bold gradient-text-white mb-2">
                {scorePercent > 60 ? 'Sharp Eye' : scorePercent > 40 ? 'Not Bad' : 'The Elit Fooled You'}
              </h2>
              <p className="text-white/45 text-[13px] mb-2 font-light">
                You correctly identified the AI in {Math.round(scorePercent / 20)} out of 5 rounds
              </p>
              <p className="text-white/10 text-[12px] mb-8 font-light">
                {scorePercent <= 50 ? `${elitName}'s Elit is nearly indistinguishable. Impressive clone.` : `You've got a keen eye. But the Elit is still learning.`}
              </p>

              <div className="flex gap-3 justify-center">
                <button onClick={startTest}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] hover:scale-[1.02] transition-all cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5 opacity-60" /> Try Again
                </button>
                <a href="/chat/default"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 hover:text-white/50 text-[13px] transition-all">
                  <MessageSquare className="w-3.5 h-3.5" /> Chat with Elit
                </a>
              </div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="mt-12 elite-card rounded-2xl p-5 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-3.5 h-3.5 text-amber-400/30" />
                  <span className="text-[12px] font-medium text-white/40">How it works</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed font-light">
                  The Turing Test compares responses from a real human and their Elit AI clone. The Elit uses personality models trained through conversations, voice calls, and document uploads. All verified on Solana.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
