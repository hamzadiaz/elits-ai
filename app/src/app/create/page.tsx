'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { generatePersonalityHash, createEmptyProfile, type PersonalityProfile } from '@/lib/personality'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

const skillSuggestions = [
  'JavaScript', 'Python', 'Rust', 'Solana', 'React', 'Machine Learning',
  'Design', 'Marketing', 'Writing', 'Crypto', 'DeFi', 'NFTs', 'Trading',
  'Leadership', 'Product Management', 'Data Science', 'DevOps',
]

const interestSuggestions = [
  'AI/ML', 'Web3', 'Gaming', 'Music', 'Art', 'Philosophy', 'Science',
  'Fitness', 'Travel', 'Food', 'Movies', 'Books', 'Sports', 'Nature',
]

const valueSuggestions = [
  'Innovation', 'Authenticity', 'Freedom', 'Knowledge', 'Community',
  'Excellence', 'Creativity', 'Integrity', 'Growth', 'Impact',
]

function TagSelector({ options, selected, onToggle, label }: {
  options: string[]
  selected: string[]
  onToggle: (tag: string) => void
  label: string
}) {
  const [custom, setCustom] = useState('')
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">{label}</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selected.includes(opt)
                ? 'bg-primary/30 text-primary-light border border-primary/50'
                : 'glass text-gray-400 hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && custom.trim()) {
              onToggle(custom.trim())
              setCustom('')
            }
          }}
          placeholder="Add custom..."
          className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50"
        />
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary-light text-xs">
              {s}
              <button onClick={() => onToggle(s)} className="hover:text-white">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CreateElitPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<PersonalityProfile>(createEmptyProfile())
  const [creating, setCreating] = useState(false)
  const [hash, setHash] = useState('')

  const toggleTag = (field: 'skills' | 'interests' | 'values', tag: string) => {
    setProfile(p => ({
      ...p,
      [field]: p[field].includes(tag) ? p[field].filter(t => t !== tag) : [...p[field], tag],
    }))
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const personalityHash = await generatePersonalityHash(profile)
      setHash(personalityHash)
      // Store profile in localStorage for training page
      localStorage.setItem('elitProfile', JSON.stringify(profile))
      localStorage.setItem('elitHash', personalityHash)
      setStep(4) // success step
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-6">🔗</div>
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            Connect your Solana wallet to create your Elit. Your wallet address becomes your on-chain identity.
          </p>
          <WalletMultiButton style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '16px',
            fontSize: '16px',
            height: '48px',
            padding: '0 32px',
          }} />
        </motion.div>
      </div>
    )
  }

  const steps = [
    // Step 0: Name & Bio
    <motion.div key="basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold text-white mb-2">Who Are You?</h2>
      <p className="text-gray-400 mb-8">Let&apos;s start with the basics.</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name or alias"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="A brief description of who you are..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Skills & Interests
    <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold text-white mb-2">Skills & Interests</h2>
      <p className="text-gray-400 mb-8">What do you know? What do you love?</p>
      <div className="space-y-8">
        <TagSelector options={skillSuggestions} selected={profile.skills} onToggle={t => toggleTag('skills', t)} label="Your Skills & Expertise" />
        <TagSelector options={interestSuggestions} selected={profile.interests} onToggle={t => toggleTag('interests', t)} label="Your Interests" />
      </div>
    </motion.div>,

    // Step 2: Values & Style
    <motion.div key="values" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold text-white mb-2">Values & Style</h2>
      <p className="text-gray-400 mb-8">How do you communicate? What do you stand for?</p>
      <div className="space-y-8">
        <TagSelector options={valueSuggestions} selected={profile.values} onToggle={t => toggleTag('values', t)} label="Core Values" />
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Communication Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Formality', field: 'formality' as const, options: ['casual', 'balanced', 'formal'] },
              { label: 'Humor', field: 'humor' as const, options: ['dry', 'playful', 'serious'] },
              { label: 'Detail Level', field: 'verbosity' as const, options: ['concise', 'balanced', 'detailed'] },
            ].map(({ label, field, options }) => (
              <div key={field}>
                <p className="text-xs text-gray-500 mb-2">{label}</p>
                <div className="space-y-1">
                  {options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setProfile(p => ({
                        ...p,
                        communicationStyle: { ...p.communicationStyle, [field]: opt },
                      }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${
                        profile.communicationStyle[field] === opt
                          ? 'bg-primary/30 text-primary-light border border-primary/50'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>,

    // Step 3: Review
    <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold text-white mb-2">Review Your Elit</h2>
      <p className="text-gray-400 mb-8">Looking good? Let&apos;s create your AI clone.</p>
      <div className="glass p-6 rounded-2xl space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
          <p className="text-white font-semibold">{profile.name || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Bio</p>
          <p className="text-gray-300">{profile.bio || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Skills</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.skills.map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-xs">{s}</span>
            ))}
            {profile.skills.length === 0 && <span className="text-gray-500 text-sm">None yet</span>}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Wallet</p>
          <p className="text-gray-300 font-mono text-sm">{publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Style</p>
          <p className="text-gray-300 text-sm">
            {profile.communicationStyle.formality} · {profile.communicationStyle.humor} · {profile.communicationStyle.verbosity}
          </p>
        </div>
      </div>
    </motion.div>,

    // Step 4: Success
    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <div className="text-6xl mb-6">✨</div>
      <h2 className="text-3xl font-bold text-white mb-4">Elit Created!</h2>
      <p className="text-gray-400 mb-6">Your personality hash has been generated. Now train your Elit to make it truly you.</p>
      <div className="glass p-4 rounded-xl mb-8 max-w-md mx-auto">
        <p className="text-xs text-gray-500 mb-1">Personality Hash (SHA-256)</p>
        <p className="text-primary-light font-mono text-xs break-all">{hash}</p>
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => router.push('/train')}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold glow hover:scale-105 transition-transform"
        >
          Train Your Elit →
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3 rounded-xl glass text-white font-semibold hover:scale-105 transition-transform"
        >
          Dashboard
        </button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        {step < 4 && (
          <div className="flex gap-2 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= step ? 'bg-gradient-to-r from-primary to-accent' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`px-6 py-3 rounded-xl glass text-gray-400 hover:text-white transition-colors ${step === 0 ? 'invisible' : ''}`}
            >
              ← Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !profile.name}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold disabled:opacity-50 hover:scale-105 transition-transform"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold glow hover:scale-105 transition-transform disabled:opacity-50"
              >
                {creating ? 'Creating...' : '✨ Create Elit'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
