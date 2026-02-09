'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { ChatInterface } from '@/components/ChatInterface'
import { VoiceTrainer } from '@/components/VoiceTrainer'
import { Avatar3D } from '@/components/Avatar3D'
import { generatePersonalityHash, generateSystemPrompt, addTrainingSession, type PersonalityProfile } from '@/lib/personality'
import { Mic, Wallet, Brain, Sparkles, ChevronRight, Zap, MessageSquare, Target, Phone } from 'lucide-react'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

interface Message { role: 'user' | 'elit'; content: string }
type TrainingMode = 'chat' | 'voice'

export default function TrainPage() {
  const { connected } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [trainingComplete, setTrainingComplete] = useState(false)
  const [hash, setHash] = useState('')
  const [mode, setMode] = useState<TrainingMode>('chat')

  useEffect(() => {
    const stored = localStorage.getItem('elitProfile')
    if (stored) setProfile(JSON.parse(stored))
  }, [])

  const startTraining = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/train', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      setMessages([{ role: 'elit', content: data.response }])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    if (connected && messages.length === 0 && profile && mode === 'chat') startTraining()
  }, [connected, profile, messages.length, startTraining, mode])

  const handleSend = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setIsLoading(true)
    try {
      const res = await fetch('/api/train', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role === 'elit' ? 'model' : 'user', content: m.content })), phase: Math.floor(newMessages.filter(m => m.role === 'user').length / 2) }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'elit', content: data.response }])
      if (newMessages.filter(m => m.role === 'user').length >= 6) setTrainingComplete(true)
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleFinalize = async () => {
    if (!profile) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
      })
      const insights = await res.json()
      let updatedProfile: PersonalityProfile = {
        ...profile,
        skills: [...new Set([...profile.skills, ...(insights.skills || [])])],
        interests: [...new Set([...profile.interests, ...(insights.interests || [])])],
        values: [...new Set([...profile.values, ...(insights.values || [])])],
        communicationStyle: insights.communicationStyle || profile.communicationStyle,
        bio: insights.bio || profile.bio,
        trainingMessages: [...profile.trainingMessages, ...messages],
      }
      updatedProfile = addTrainingSession(updatedProfile, {
        type: 'chat', messageCount: messages.length,
        extractedSkills: insights.skills || [], extractedTraits: [],
        summary: `Chat training session with ${messages.length} messages`,
      })
      const personalityHash = await generatePersonalityHash(updatedProfile)
      const systemPrompt = generateSystemPrompt(updatedProfile)
      localStorage.setItem('elitProfile', JSON.stringify(updatedProfile))
      localStorage.setItem('elitHash', personalityHash)
      localStorage.setItem('elitSystemPrompt', systemPrompt)
      setHash(personalityHash)
      setProfile(updatedProfile)
      setMessages(prev => [...prev, {
        role: 'elit',
        content: `Training complete. Personality model built.\n\n**Hash:** ${personalityHash.slice(0, 16)}...\n\nLearned: ${updatedProfile.skills.slice(0, 3).join(', ')} and more.`
      }])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleVoiceTranscript = useCallback((entries: { speaker: string; text: string }[]) => {
    if (!profile) return
    const voiceMessages = entries.map(e => ({
      role: (e.speaker === 'user' ? 'user' : 'elit') as 'user' | 'elit',
      content: e.text,
    }))
    if (voiceMessages.length > 0) {
      const updatedProfile = { ...profile, trainingMessages: [...profile.trainingMessages, ...voiceMessages] }
      localStorage.setItem('elitProfile', JSON.stringify(updatedProfile))
    }
  }, [profile])

  if (!connected) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-7 h-7 text-amber-300/40" />
          </div>
          <h1 className="text-2xl font-bold gradient-text-white mb-3">Connect to Train</h1>
          <p className="text-white/45 mb-8 text-[13px] font-light">Connect your wallet and create an Elit first.</p>
          <WalletMultiButton style={{ background: 'rgba(212, 160, 23, 0.15)', border: '0.5px solid rgba(212, 160, 23, 0.25)', borderRadius: '14px', fontSize: '13px', fontWeight: '500', height: '44px', color: '#f0c940' }} />
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mx-auto mb-8">
            <Brain className="w-7 h-7 text-amber-300/40" />
          </div>
          <h1 className="text-2xl font-bold gradient-text-white mb-3">Create Your Elit First</h1>
          <p className="text-white/45 mb-8 text-[13px] font-light">You need to create an Elit before training.</p>
          <a href="/create" className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] hover:scale-[1.02] transition-all">
            Create Elit <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-all" />
          </a>
        </motion.div>
      </div>
    )
  }

  const userMsgCount = messages.filter(m => m.role === 'user').length

  return (
    <div className="h-[calc(100vh-4rem)] flex max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="hidden lg:flex w-72 flex-col border-r border-white/[0.06] p-6">
        <div className="flex items-center gap-3 mb-8">
          <Avatar3D avatarUrl={profile.avatarUrl} name={profile.name} size="sm" />
          <div>
            <p className="text-[13px] font-medium text-white/70">{profile.name}</p>
            <p className="text-[11px] text-white/40">Training Session</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mb-6">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-3">Training Mode</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { mode: 'chat' as TrainingMode, icon: MessageSquare, label: 'Chat' },
              { mode: 'voice' as TrainingMode, icon: Phone, label: 'Voice' },
            ].map(m => (
              <button key={m.mode} onClick={() => setMode(m.mode)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] transition-all duration-300 cursor-pointer ${
                  mode === m.mode ? 'bg-amber-500/[0.1] text-amber-300/60 border border-amber-500/25' : 'bg-white/[0.04] text-white/45 border border-white/[0.06] hover:border-white/[0.06]'
                }`}>
                <m.icon className="w-3.5 h-3.5" /> {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Progress</p>
          <div className="elite-card rounded-xl p-4 space-y-3">
            {[
              { icon: MessageSquare, label: 'Messages', value: profile.trainingMessages.length + messages.length, color: 'text-amber-300/40' },
              { icon: Target, label: 'Sessions', value: profile.trainingSessions.length + 1, color: 'text-amber-300/35' },
              { icon: Zap, label: 'Knowledge', value: profile.knowledgeGraph?.length || 0, color: 'text-amber-300/30' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[12px] text-white/45 font-light">{s.label}</span>
                <span className="ml-auto text-[12px] font-medium text-white/50">{s.value}</span>
              </div>
            ))}
          </div>

          {mode === 'chat' && (
            <div>
              <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                <span>Session Progress</span>
                <span>{Math.min(100, Math.round(userMsgCount / 6 * 100))}%</span>
              </div>
              <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.round(userMsgCount / 6 * 100))}%` }}
                  transition={{ duration: 0.6 }} />
              </div>
            </div>
          )}
        </div>

        {profile.skills.length > 0 && (
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-3">Detected Skills</p>
            <div className="flex flex-wrap gap-1">
              {profile.skills.slice(0, 8).map(s => <span key={s} className="elite-tag text-[10px]">{s}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {mode === 'voice' ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <VoiceTrainer elitName={profile.name} avatarUrl={profile.avatarUrl} onTranscriptUpdate={handleVoiceTranscript} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 rounded-none overflow-hidden">
              <ChatInterface messages={messages} onSend={handleSend} isLoading={isLoading}
                title={`Training ${profile.name}'s Elit`} subtitle="Talk naturally. Your Elit is learning."
                placeholder="Tell your Elit about yourself..." />
            </div>
            {trainingComplete && !hash && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-4">
                <button onClick={handleFinalize} disabled={isLoading}
                  className="w-full group flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.01] transition-all disabled:opacity-40 cursor-pointer">
                  <Sparkles className="w-4 h-4 opacity-60" /> Finalize Training & Generate Hash
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
