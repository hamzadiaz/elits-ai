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

interface Message {
  role: 'user' | 'elit'
  content: string
}

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role === 'elit' ? 'model' : 'user', content: m.content })),
          phase: Math.floor(newMessages.filter(m => m.role === 'user').length / 2),
        }),
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        type: 'chat',
        messageCount: messages.length,
        extractedSkills: insights.skills || [],
        extractedTraits: [],
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
        content: `🎉 Training complete! I've analyzed our conversation and built your personality model.\n\n**Personality Hash:** ${personalityHash.slice(0, 16)}...\n\nI've learned about your skills (${updatedProfile.skills.slice(0, 3).join(', ')}), your communication style, and what makes you unique.`
      }])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleVoiceTranscript = useCallback((entries: { speaker: string; text: string }[]) => {
    // Store voice transcript for later extraction
    if (!profile) return
    const voiceMessages = entries.map(e => ({
      role: (e.speaker === 'user' ? 'user' : 'elit') as 'user' | 'elit',
      content: e.text,
    }))
    if (voiceMessages.length > 0) {
      const updatedProfile = {
        ...profile,
        trainingMessages: [...profile.trainingMessages, ...voiceMessages],
      }
      localStorage.setItem('elitProfile', JSON.stringify(updatedProfile))
    }
  }, [profile])

  if (!connected) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-white mb-3">Connect to Train</h1>
          <p className="text-gray-500 mb-8 text-sm">Connect your wallet and create an Elit first.</p>
          <WalletMultiButton style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', borderRadius: '14px', fontSize: '15px', fontWeight: '600', height: '48px' }} />
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
            <Brain className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-white mb-3">Create Your Elit First</h1>
          <p className="text-gray-500 mb-8 text-sm">You need to create an Elit before you can train it.</p>
          <a href="/create" className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold hover:scale-[1.02] transition-transform">
            Create Elit
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    )
  }

  const userMsgCount = messages.filter(m => m.role === 'user').length

  return (
    <div className="h-[calc(100vh-4rem)] flex max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="hidden lg:flex w-72 flex-col border-r border-white/[0.04] p-6">
        <div className="flex items-center gap-3 mb-8">
          <Avatar3D avatarUrl={profile.avatarUrl} name={profile.name} size="sm" />
          <div>
            <p className="text-sm font-semibold text-white">{profile.name}</p>
            <p className="text-xs text-gray-600">Training Session</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mb-6">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-3">Training Mode</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                mode === 'chat'
                  ? 'bg-primary/20 text-primary-light border border-primary/40'
                  : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Chat
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                mode === 'voice'
                  ? 'bg-primary/20 text-primary-light border border-primary/40'
                  : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <Phone className="w-4 h-4" /> Voice
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">Progress</p>
          <div className="gradient-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-gray-400">Messages</span>
              <span className="ml-auto text-sm font-semibold text-white">{profile.trainingMessages.length + messages.length}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-4 h-4 text-blue" />
              <span className="text-sm text-gray-400">Sessions</span>
              <span className="ml-auto text-sm font-semibold text-white">{profile.trainingSessions.length + 1}</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-gray-400">Knowledge</span>
              <span className="ml-auto text-sm font-semibold text-white">{profile.knowledgeGraph?.length || 0}</span>
            </div>
          </div>

          {mode === 'chat' && (
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                <span>Session Progress</span>
                <span>{Math.min(100, Math.round(userMsgCount / 6 * 100))}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-blue rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round(userMsgCount / 6 * 100))}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {profile.skills.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-3">Detected Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.slice(0, 8).map(s => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary-light text-[10px] border border-primary/20">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {mode === 'voice' ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <VoiceTrainer
                elitName={profile.name}
                avatarUrl={profile.avatarUrl}
                onTranscriptUpdate={handleVoiceTranscript}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 rounded-none overflow-hidden">
              <ChatInterface
                messages={messages}
                onSend={handleSend}
                isLoading={isLoading}
                title={`Training ${profile.name}'s Elit`}
                subtitle="Talk naturally. Your Elit is learning who you are."
                placeholder="Tell your Elit about yourself..."
              />
            </div>
            {trainingComplete && !hash && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 pb-4">
                <button
                  onClick={handleFinalize}
                  disabled={isLoading}
                  className="w-full group flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-primary-dark via-primary to-blue text-white font-bold text-base btn-glow hover:scale-[1.01] transition-transform disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  Finalize Training & Generate Hash
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
