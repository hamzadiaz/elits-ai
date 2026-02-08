'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { ChatInterface } from '@/components/ChatInterface'
import { generatePersonalityHash, generateSystemPrompt, type PersonalityProfile } from '@/lib/personality'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

interface Message {
  role: 'user' | 'elit'
  content: string
}

export default function TrainPage() {
  const { connected } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [trainingComplete, setTrainingComplete] = useState(false)
  const [hash, setHash] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('elitProfile')
    if (stored) {
      setProfile(JSON.parse(stored))
    }
  }, [])

  // Start training conversation
  const startTraining = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/train', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      setMessages([{ role: 'elit', content: data.response }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (connected && messages.length === 0 && profile) {
      startTraining()
    }
  }, [connected, profile, messages.length, startTraining])

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

      // After 6+ user messages, offer to finalize
      if (newMessages.filter(m => m.role === 'user').length >= 6) {
        setTrainingComplete(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!profile) return
    setIsLoading(true)
    try {
      // Extract insights from training conversation
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.map(m => ({ role: m.role, content: m.content })) }),
      })
      const insights = await res.json()

      const updatedProfile: PersonalityProfile = {
        ...profile,
        skills: [...new Set([...profile.skills, ...(insights.skills || [])])],
        interests: [...new Set([...profile.interests, ...(insights.interests || [])])],
        values: [...new Set([...profile.values, ...(insights.values || [])])],
        communicationStyle: insights.communicationStyle || profile.communicationStyle,
        bio: insights.bio || profile.bio,
        trainingMessages: messages,
      }

      const personalityHash = await generatePersonalityHash(updatedProfile)
      const systemPrompt = generateSystemPrompt(updatedProfile)

      localStorage.setItem('elitProfile', JSON.stringify(updatedProfile))
      localStorage.setItem('elitHash', personalityHash)
      localStorage.setItem('elitSystemPrompt', systemPrompt)
      setHash(personalityHash)
      setProfile(updatedProfile)

      setMessages(prev => [...prev, {
        role: 'elit',
        content: `🎉 Training complete! I've analyzed our conversation and built your personality model.\n\n**Personality Hash:** ${personalityHash.slice(0, 16)}...\n\nI've learned about your skills (${updatedProfile.skills.slice(0, 3).join(', ')}), your communication style, and what makes you unique. You can now chat with your Elit or continue training to refine me further!`
      }])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-6xl mb-6">🎙️</div>
          <h1 className="text-3xl font-bold text-white mb-4">Connect to Train</h1>
          <p className="text-gray-400 mb-8">Connect your wallet and create an Elit first.</p>
          <WalletMultiButton style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '16px', fontSize: '16px', height: '48px' }} />
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-4">Create Your Elit First</h1>
          <p className="text-gray-400 mb-8">You need to create an Elit before you can train it.</p>
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
          title={`Training ${profile.name}'s Elit`}
          subtitle="Talk naturally. Your Elit is learning who you are."
          placeholder="Tell your Elit about yourself..."
        />
      </div>

      {/* Finalize button */}
      {trainingComplete && !hash && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4"
        >
          <button
            onClick={handleFinalize}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg glow hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            ✨ Finalize Training & Generate Personality Hash
          </button>
        </motion.div>
      )}
    </div>
  )
}
