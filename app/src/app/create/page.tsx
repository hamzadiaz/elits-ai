'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { generatePersonalityHash, createEmptyProfile, type PersonalityProfile } from '@/lib/personality'
import { Avatar3D } from '@/components/Avatar3D'
import { getConnection, getProvider, getProgram, createElitOnChain, explorerUrl } from '@/lib/solana'
import { User, Sparkles, ChevronLeft, ChevronRight, Check, Wallet, Upload, Zap, Heart, MessageSquare, Loader2, ExternalLink } from 'lucide-react'

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
      <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-300 cursor-pointer ${
              selected.includes(opt)
                ? 'bg-amber-500/[0.12] text-amber-300/80 border border-amber-500/30 shadow-[0_0_15px_rgba(212,160,23,0.05)]'
                : 'bg-white/[0.02] border border-white/[0.08] text-white/25 hover:text-white/40 hover:border-white/[0.08]'
            }`}
          >
            {selected.includes(opt) && <Check className="w-2.5 h-2.5 inline mr-1" />}
            {opt}
          </button>
        ))}
      </div>
      <input
        value={custom}
        onChange={e => setCustom(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && custom.trim()) { onToggle(custom.trim()); setCustom('') }
        }}
        placeholder="Add custom..."
        className="elite-input w-full"
      />
    </div>
  )
}

const stepInfo = [
  { icon: User, label: 'Identity' },
  { icon: Zap, label: 'Skills' },
  { icon: Heart, label: 'Values' },
  { icon: MessageSquare, label: 'Review' },
]

export default function CreateElitPage() {
  const { connected, publicKey, signTransaction, signAllTransactions } = useWallet()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<PersonalityProfile>(createEmptyProfile())
  const [creating, setCreating] = useState(false)
  const [hash, setHash] = useState('')
  const [txSignature, setTxSignature] = useState('')
  const [txError, setTxError] = useState('')
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
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setAvatarPreview(dataUrl)
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
        setProfile(p => ({ ...p, avatarUrl: dataUrl }))
      } finally {
        setGeneratingAvatar(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    setCreating(true)
    setTxError('')
    try {
      const personalityHash = await generatePersonalityHash(profile)
      setHash(personalityHash)
      localStorage.setItem('elitProfile', JSON.stringify(profile))
      localStorage.setItem('elitHash', personalityHash)

      // Send on-chain transaction
      if (publicKey && signTransaction && signAllTransactions) {
        try {
          const connection = getConnection()
          const provider = getProvider(connection, { publicKey, signTransaction, signAllTransactions } as never)
          const program = getProgram(provider)
          const sig = await createElitOnChain(
            program,
            publicKey,
            profile.name.slice(0, 50),
            (profile.bio || '').slice(0, 280),
            personalityHash.slice(0, 64),
            (profile.avatarUrl || '').slice(0, 200),
          )
          setTxSignature(sig)
          localStorage.setItem('elitTxSignature', sig)
        } catch (err: unknown) {
          console.error('On-chain creation failed:', err)
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('already in use')) {
            setTxError('Elit already exists on-chain for this wallet!')
          } else {
            setTxError(`On-chain tx failed: ${msg.slice(0, 120)}`)
          }
        }
      }
      setStep(4)
    } catch (err) { console.error(err); setTxError(String(err)) }
    finally { setCreating(false) }
  }

  if (!connected) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-7 h-7 text-amber-300/40" />
          </div>
          <h1 className="text-2xl font-bold gradient-text-white mb-3">Connect Your Wallet</h1>
          <p className="text-white/45 mb-8 text-[13px] font-light leading-relaxed">
            Connect your Solana wallet to create your Elit. Your wallet address becomes your on-chain identity.
          </p>
          <WalletMultiButton style={{
            background: 'rgba(212, 160, 23, 0.15)',
            border: '0.5px solid rgba(212, 160, 23, 0.25)',
            borderRadius: '14px', fontSize: '13px', fontWeight: '500', height: '44px', padding: '0 24px',
            color: '#f0c940',
          }} />
        </motion.div>
      </div>
    )
  }

  const steps = [
    // Step 0: Identity
    <motion.div key="basics" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.5 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Who Are You?</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">Let&apos;s start with the basics.</p>
      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Name</label>
          <input
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name or alias"
            className="elite-input w-full"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Bio</label>
          <textarea
            value={profile.bio}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="A brief description of who you are..."
            rows={3}
            className="elite-input w-full resize-none"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Profile Photo → 3D Avatar</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          {avatarPreview ? (
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar3D avatarUrl={avatarPreview} name={profile.name || '?'} size="lg" state={generatingAvatar ? 'thinking' : 'idle'} />
                {generatingAvatar && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/[0.1] border border-amber-500/25">
                    <Loader2 className="w-2.5 h-2.5 text-amber-300/60 animate-spin" />
                    <span className="text-[10px] text-amber-300/50">Generating...</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[13px] text-white/40 mb-2">{generatingAvatar ? 'Creating avatar...' : 'Your AI Avatar'}</p>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => fileInputRef.current?.click()} className="text-[11px] text-amber-300/40 hover:text-amber-300/60 transition-colors cursor-pointer text-left">Change photo</button>
                  {!generatingAvatar && avatarPreview && (
                    <>
                      <button onClick={async () => {
                        if (!avatarPreview) return
                        setGeneratingAvatar(true)
                        try {
                          const base64 = avatarPreview.split(',')[1]
                          const mime = avatarPreview.split(';')[0].split(':')[1] || 'image/png'
                          const res = await fetch('/api/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64, mimeType: mime }) })
                          const data = await res.json()
                          if (data.avatarUrl) { setAvatarPreview(data.avatarUrl); setProfile(p => ({ ...p, avatarUrl: data.avatarUrl })) }
                        } catch (err) { console.error(err) }
                        setGeneratingAvatar(false)
                      }} className="text-[11px] text-amber-300/40 hover:text-amber-300/60 transition-colors cursor-pointer text-left">🔄 Regenerate</button>
                      <button onClick={() => {
                        const a = document.createElement('a')
                        a.href = avatarPreview
                        a.download = `elit-avatar-${profile.name || 'avatar'}.png`
                        a.click()
                      }} className="text-[11px] text-amber-300/40 hover:text-amber-300/60 transition-colors cursor-pointer text-left">📥 Download PNG</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-white/[0.08] rounded-2xl p-8 text-center hover:border-amber-500/25 transition-all duration-500 cursor-pointer group"
            >
              <Upload className="w-7 h-7 text-white/10 mx-auto mb-3 group-hover:text-amber-400/30 transition-colors duration-500" />
              <p className="text-[13px] text-white/45 font-light">Upload a photo to generate your 3D avatar</p>
              <p className="text-[11px] text-white/10 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>,

    // Step 1: Skills
    <motion.div key="skills" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.5 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Skills & Interests</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">What do you know? What excites you?</p>
      <div className="space-y-8">
        <TagSelector options={skillSuggestions} selected={profile.skills} onToggle={t => toggleTag('skills', t)} label="Your Skills & Expertise" />
        <TagSelector options={interestSuggestions} selected={profile.interests} onToggle={t => toggleTag('interests', t)} label="Your Interests" />
      </div>
    </motion.div>,

    // Step 2: Values
    <motion.div key="values" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.5 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Values & Style</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">How do you communicate? What matters to you?</p>
      <div className="space-y-8">
        <TagSelector options={valueSuggestions} selected={profile.values} onToggle={t => toggleTag('values', t)} label="Core Values" />
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">Communication Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Formality', field: 'formality' as const, options: ['casual', 'balanced', 'formal'] },
              { label: 'Humor', field: 'humor' as const, options: ['dry', 'playful', 'serious'] },
              { label: 'Detail Level', field: 'verbosity' as const, options: ['concise', 'balanced', 'detailed'] },
            ].map(({ label, field, options }) => (
              <div key={field} className="elite-card rounded-xl p-4">
                <p className="text-[10px] text-white/40 mb-2.5 font-medium uppercase tracking-wider">{label}</p>
                <div className="space-y-1">
                  {options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setProfile(p => ({ ...p, communicationStyle: { ...p.communicationStyle, [field]: opt } }))}
                      className={`w-full px-3 py-2 rounded-lg text-[12px] text-left transition-all duration-300 cursor-pointer ${
                        profile.communicationStyle[field] === opt
                          ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25'
                          : 'bg-white/[0.03] text-white/25 hover:bg-white/[0.03] border border-transparent'
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
    <motion.div key="review" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.5 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Review Your Elit</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">Everything look right?</p>
      <div className="elite-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4">
          <Avatar3D avatarUrl={avatarPreview || profile.avatarUrl} name={profile.name || '?'} size="md" />
          <div>
            <p className="text-white/90 font-semibold text-base">{profile.name || 'Unnamed'}</p>
            <p className="text-white/40 text-[12px] font-mono">{publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-6)}</p>
          </div>
        </div>
        <div className="h-px bg-white/[0.03]" />
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Bio</p>
          <p className="text-white/30 text-[13px] font-light">{profile.bio || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map(s => <span key={s} className="elite-tag text-[11px]">{s}</span>)}
            {profile.skills.length === 0 && <span className="text-white/40 text-[13px]">None selected</span>}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Style</p>
          <p className="text-white/30 text-[13px] font-light">
            {profile.communicationStyle.formality} · {profile.communicationStyle.humor} · {profile.communicationStyle.verbosity}
          </p>
        </div>
      </div>
    </motion.div>,

    // Step 4: Success
    <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }} className="mb-6">
        <Avatar3D avatarUrl={avatarPreview || profile.avatarUrl} name={profile.name || '?'} size="xl" state="speaking" />
      </motion.div>
      <h2 className="text-2xl font-bold gradient-text-white mb-3">Elit Created</h2>
      <p className="text-white/45 mb-6 text-[13px] font-light">Your personality hash has been generated. Train your Elit to make it truly you.</p>
      <div className="elite-card rounded-xl p-4 mb-4 max-w-md mx-auto">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Personality Hash (SHA-256)</p>
        <p className="text-amber-300/50 font-mono text-[11px] break-all">{hash}</p>
      </div>
      {txSignature && (
        <div className="elite-card rounded-xl p-4 mb-4 max-w-md mx-auto">
          <p className="text-[10px] text-emerald-400/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">✅ Registered On-Chain</p>
          <a href={explorerUrl(txSignature)} target="_blank" rel="noopener noreferrer"
            className="text-amber-300/50 font-mono text-[11px] break-all hover:text-amber-300/70 transition-colors flex items-center gap-1.5">
            {txSignature.slice(0, 20)}...{txSignature.slice(-20)}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      )}
      {txError && (
        <div className="elite-card rounded-xl p-4 mb-4 max-w-md mx-auto border-amber-500/20">
          <p className="text-[10px] text-amber-400/50 uppercase tracking-wider mb-1">⚠️ On-Chain Status</p>
          <p className="text-white/40 text-[11px]">{txError}</p>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <button onClick={() => router.push('/train')} className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-all cursor-pointer">
          Train Your Elit <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-all" />
        </button>
        <button onClick={() => router.push('/dashboard')} className="px-7 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 font-medium text-[13px] hover:text-white/50 hover:border-white/[0.08] transition-all cursor-pointer">
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
                <div className={`flex items-center gap-2 transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    i < step ? 'bg-amber-500/[0.1] border border-amber-500/25'
                      : i === step ? 'bg-gradient-to-br from-amber-600 to-amber-500 shadow-[0_0_25px_rgba(212,160,23,0.1)]'
                        : 'bg-white/[0.02] border border-white/[0.08]'
                  }`}>
                    {i < step ? <Check className="w-3 h-3 text-amber-300/60" /> : <s.icon className="w-3 h-3 text-white/50" />}
                  </div>
                  <span className="text-[11px] text-white/45 hidden sm:block">{s.label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-px transition-all duration-500 ${i < step ? 'bg-amber-500/[0.2]' : 'bg-white/[0.03]'}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

        {step < 4 && (
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/25 hover:text-white/50 hover:border-white/[0.08] transition-all cursor-pointer ${step === 0 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !profile.name}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] disabled:opacity-20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Continue <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={creating}
                className="group inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.02] transition-all disabled:opacity-40 cursor-pointer"
              >
                {creating ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5 opacity-60" /> Create Elit</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
