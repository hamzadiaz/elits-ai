'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { generatePersonalityHash, createEmptyProfile, type PersonalityProfile } from '@/lib/personality'
import { Avatar3D } from '@/components/Avatar3D'
import { User, Sparkles, ChevronLeft, ChevronRight, Check, Wallet, Upload, Zap, Heart, MessageSquare, Loader2 } from 'lucide-react'

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
      <label className="block text-sm font-medium text-gray-400 mb-3">{label}</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3.5 py-1.5 rounded-lg text-sm transition-all duration-200 ${
              selected.includes(opt)
                ? 'bg-primary/20 text-primary-light border border-primary/40 shadow-[0_0_10px_rgba(124,58,237,0.1)]'
                : 'bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]'
            }`}
          >
            {selected.includes(opt) && <Check className="w-3 h-3 inline mr-1" />}
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
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_20px_rgba(124,58,237,0.08)] transition-all"
        />
      </div>
    </div>
  )
}

const stepInfo = [
  { icon: User, label: 'Identity', desc: 'Name & Bio' },
  { icon: Zap, label: 'Skills', desc: 'Skills & Interests' },
  { icon: Heart, label: 'Values', desc: 'Values & Style' },
  { icon: MessageSquare, label: 'Review', desc: 'Confirm & Create' },
]

export default function CreateElitPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<PersonalityProfile>(createEmptyProfile())
  const [creating, setCreating] = useState(false)
  const [hash, setHash] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [generatingAvatar, setGeneratingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleTag = (field: 'skills' | 'interests' | 'values', tag: string) => {
    setProfile(p => ({
      ...p,
      [field]: p[field].includes(tag) ? p[field].filter(t => t !== tag) : [...p[field], tag],
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setAvatarPreview(dataUrl)

      // Try to generate avatar via Gemini
      setGeneratingAvatar(true)
      try {
        const base64 = dataUrl.split(',')[1]
        const res = await fetch('/api/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })
        const data = await res.json()
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl)
          setProfile(p => ({ ...p, avatarUrl: data.avatarUrl }))
        }
      } catch (err) {
        console.error('Avatar generation failed:', err)
        // Keep original preview
        setProfile(p => ({ ...p, avatarUrl: dataUrl }))
      } finally {
        setGeneratingAvatar(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const personalityHash = await generatePersonalityHash(profile)
      setHash(personalityHash)
      localStorage.setItem('elitProfile', JSON.stringify(profile))
      localStorage.setItem('elitHash', personalityHash)
      setStep(4)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-white mb-3">Connect Your Wallet</h1>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Connect your Solana wallet to create your Elit. Your wallet address becomes your on-chain identity.
          </p>
          <WalletMultiButton style={{
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            borderRadius: '14px', fontSize: '15px', fontWeight: '600', height: '48px', padding: '0 28px', border: 'none',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)',
          }} />
        </motion.div>
      </div>
    )
  }

  const steps = [
    // Step 0: Name & Bio & Photo
    <motion.div key="basics" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold gradient-text-white mb-1">Who Are You?</h2>
      <p className="text-gray-600 text-sm mb-8">Let&apos;s start with the basics.</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
          <input
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name or alias"
            className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_30px_rgba(124,58,237,0.08)] transition-all text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="A brief description of who you are..."
            rows={3}
            className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_30px_rgba(124,58,237,0.08)] transition-all resize-none text-base"
          />
        </div>
        {/* Avatar upload */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Profile Photo → 3D Avatar</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          
          {avatarPreview ? (
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar3D avatarUrl={avatarPreview} name={profile.name || '?'} size="lg" state={generatingAvatar ? 'thinking' : 'idle'} />
                {generatingAvatar && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                    <Loader2 className="w-3 h-3 text-primary-light animate-spin" />
                    <span className="text-[10px] text-primary-light">Generating avatar...</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {generatingAvatar ? 'Creating your AI avatar...' : 'Your AI Avatar'}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary-light hover:text-primary transition-colors"
                >
                  Change photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/[0.06] rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3 group-hover:text-primary/60 transition-colors" />
              <p className="text-sm text-gray-600">Upload a photo to generate your 3D avatar</p>
              <p className="text-xs text-gray-700 mt-1">PNG, JPG up to 5MB • AI will transform it</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>,

    // Step 1: Skills & Interests
    <motion.div key="skills" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold gradient-text-white mb-1">Skills & Interests</h2>
      <p className="text-gray-600 text-sm mb-8">What do you know? What excites you?</p>
      <div className="space-y-8">
        <TagSelector options={skillSuggestions} selected={profile.skills} onToggle={t => toggleTag('skills', t)} label="Your Skills & Expertise" />
        <TagSelector options={interestSuggestions} selected={profile.interests} onToggle={t => toggleTag('interests', t)} label="Your Interests" />
      </div>
    </motion.div>,

    // Step 2: Values & Style
    <motion.div key="values" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold gradient-text-white mb-1">Values & Style</h2>
      <p className="text-gray-600 text-sm mb-8">How do you communicate? What matters to you?</p>
      <div className="space-y-8">
        <TagSelector options={valueSuggestions} selected={profile.values} onToggle={t => toggleTag('values', t)} label="Core Values" />
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">Communication Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Formality', field: 'formality' as const, options: ['casual', 'balanced', 'formal'] },
              { label: 'Humor', field: 'humor' as const, options: ['dry', 'playful', 'serious'] },
              { label: 'Detail Level', field: 'verbosity' as const, options: ['concise', 'balanced', 'detailed'] },
            ].map(({ label, field, options }) => (
              <div key={field} className="gradient-border rounded-xl p-4">
                <p className="text-xs text-gray-600 mb-2 font-medium">{label}</p>
                <div className="space-y-1.5">
                  {options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setProfile(p => ({
                        ...p,
                        communicationStyle: { ...p.communicationStyle, [field]: opt },
                      }))}
                      className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 ${
                        profile.communicationStyle[field] === opt
                          ? 'bg-primary/20 text-primary-light border border-primary/40'
                          : 'bg-white/[0.02] text-gray-500 hover:bg-white/[0.05] border border-transparent'
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
    <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
      <h2 className="text-2xl font-bold gradient-text-white mb-1">Review Your Elit</h2>
      <p className="text-gray-600 text-sm mb-8">Everything look right? Let&apos;s bring it to life.</p>
      <div className="gradient-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar3D avatarUrl={avatarPreview || profile.avatarUrl} name={profile.name || '?'} size="md" />
          <div>
            <p className="text-white font-semibold text-lg">{profile.name || 'Unnamed'}</p>
            <p className="text-gray-500 text-sm font-mono">{publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-6)}</p>
          </div>
        </div>
        <div className="h-px bg-white/[0.04]" />
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Bio</p>
          <p className="text-gray-400 text-sm">{profile.bio || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary-light text-xs border border-primary/20">{s}</span>
            ))}
            {profile.skills.length === 0 && <span className="text-gray-600 text-sm">None selected</span>}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Style</p>
          <p className="text-gray-400 text-sm">
            {profile.communicationStyle.formality} · {profile.communicationStyle.humor} · {profile.communicationStyle.verbosity}
          </p>
        </div>
      </div>
    </motion.div>,

    // Step 4: Success
    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <Avatar3D avatarUrl={avatarPreview || profile.avatarUrl} name={profile.name || '?'} size="xl" state="speaking" />
      </motion.div>
      <h2 className="text-3xl font-bold gradient-text-white mb-3">Elit Created!</h2>
      <p className="text-gray-500 mb-6 text-sm">Your personality hash has been generated. Now train your Elit to make it truly you.</p>
      <div className="gradient-border rounded-xl p-4 mb-8 max-w-md mx-auto">
        <p className="text-xs text-gray-600 mb-1">Personality Hash (SHA-256)</p>
        <p className="text-primary-light font-mono text-xs break-all">{hash}</p>
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => router.push('/train')}
          className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold btn-glow hover:scale-[1.02] transition-transform"
        >
          Train Your Elit
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-gray-400 font-medium hover:text-white hover:border-white/[0.15] transition-all"
        >
          Dashboard
        </button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {step < 4 && (
          <div className="flex items-center gap-3 mb-10">
            {stepInfo.map((s, i) => (
              <div key={i} className="flex items-center gap-3 flex-1">
                <div className={`flex items-center gap-2 transition-all duration-300 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    i < step ? 'bg-primary/20 border border-primary/40'
                      : i === step ? 'bg-gradient-to-br from-primary-dark to-blue shadow-[0_0_20px_rgba(124,58,237,0.2)]'
                        : 'bg-white/[0.03] border border-white/[0.06]'
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5 text-primary-light" /> : <s.icon className="w-3.5 h-3.5 text-white/70" />}
                  </div>
                  <span className="text-xs text-gray-500 hidden sm:block">{s.label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px transition-all duration-300 ${i < step ? 'bg-primary/40' : 'bg-white/[0.04]'}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

        {step < 4 && (
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-gray-500 hover:text-white hover:border-white/[0.12] transition-all ${step === 0 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !profile.name}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold disabled:opacity-30 hover:scale-[1.02] transition-transform"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-dark via-primary to-blue text-white font-bold btn-glow hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {creating ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Create Elit</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
