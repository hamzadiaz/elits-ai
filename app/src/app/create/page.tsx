'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CATEGORIES, AVATAR_STYLES, RARITY_CONFIG, type AgentCategory, type AvatarStyle, type Rarity } from '@/lib/agents'
import { useToast } from '@/components/Toast'
import {
  User, Sparkles, ChevronLeft, ChevronRight, Check, Zap, Brain, Eye, Palette,
  DollarSign, FileCheck, Tag, MessageSquare, Sliders, Globe, Upload, Link2, FileText,
  BarChart3, Code, Heart, Headphones, BookOpen, Scale, UserCheck, Database,
  Share2, Gamepad2, Languages, Mic, Building2, Briefcase, Shield,
  PenTool, Monitor, Mail, Calendar, Lock, TrendingUp, Plus, X, ExternalLink
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  DeFi: BarChart3, Content: MessageSquare, 'Dev Tools': Code, Research: Brain,
  'Customer Support': Headphones, 'Personal Assistant': UserCheck, Education: BookOpen,
  Legal: Scale, Health: Heart, Creative: Palette, Sales: DollarSign,
  'Data Analysis': Database, 'Social Media': Share2, 'Crypto Intel': Eye,
  Gaming: Gamepad2, Translation: Languages, 'Voice / Persona': Mic,
  DAO: Shield, 'Real Estate': Building2, Recruiting: Briefcase,
}

const SKILL_CATEGORIES = [
  { id: 'text', label: 'Text Generation', icon: '📝', desc: 'Writing, editing, summarizing' },
  { id: 'code', label: 'Code Generation', icon: '💻', desc: 'Write, review, debug code' },
  { id: 'data', label: 'Data Analysis', icon: '📊', desc: 'CSV parsing, charts, SQL' },
  { id: 'web', label: 'Web Browsing', icon: '🌐', desc: 'Search, scrape, research' },
  { id: 'social', label: 'Social Media', icon: '🐦', desc: 'Post drafts, engagement analysis' },
  { id: 'defi', label: 'DeFi Integration', icon: '💰', desc: 'Token analysis, yield comparison' },
  { id: 'api', label: 'API Access', icon: '🔗', desc: 'Custom API endpoints' },
  { id: 'email', label: 'Email/Communication', icon: '📧', desc: 'Draft emails, responses' },
  { id: 'creative', label: 'Image/Creative', icon: '🎨', desc: 'Prompt generation, art direction' },
  { id: 'task', label: 'Task Management', icon: '📅', desc: 'Scheduling, reminders, workflows' },
  { id: 'contract', label: 'Smart Contract', icon: '🔒', desc: 'Audit, deploy, interact' },
  { id: 'trading', label: 'Trading', icon: '📈', desc: 'Signals, analysis, portfolio' },
]

const ACCESS_LEVELS = [
  { id: 'basic', label: 'Basic', icon: '🟢', desc: 'Text-only interactions', color: 'emerald' },
  { id: 'standard', label: 'Standard', icon: '🟡', desc: 'Text + data analysis + web browsing', color: 'yellow' },
  { id: 'advanced', label: 'Advanced', icon: '🔴', desc: 'Full tool access including DeFi, APIs, smart contracts', color: 'red' },
  { id: 'unlimited', label: 'Unlimited', icon: '⚡', desc: 'Everything + agent-to-agent communication', color: 'purple' },
]

const COMMUNICATION_STYLES = ['Professional', 'Casual', 'Technical', 'Friendly', 'Witty']
const LANGUAGES = ['English', 'Spanish', 'Arabic', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Russian', 'Hindi']

const PRICE_RANGES: Record<string, [number, number]> = {
  DeFi: [2, 8], Content: [1, 3], 'Dev Tools': [2, 10], Research: [2, 5],
  'Customer Support': [1, 3], 'Personal Assistant': [0.5, 2], Education: [0.5, 2],
  Legal: [3, 8], Health: [0.5, 2], Creative: [1, 3], Sales: [2, 5],
  'Data Analysis': [2, 5], 'Social Media': [1, 3], 'Crypto Intel': [2, 8],
  Gaming: [0.5, 2], Translation: [1, 3], 'Voice / Persona': [0.5, 2],
  DAO: [2, 5], 'Real Estate': [2, 5], Recruiting: [1, 4],
}

interface AgentForm {
  name: string
  category: AgentCategory | ''
  description: string
  tags: string[]
  systemPrompt: string
  traits: { friendly: number; creative: number; verbose: number; cautious: number }
  commStyle: string
  languages: string[]
  skills: string[]
  accessLevel: string
  knowledgeUrls: string[]
  knowledgeText: string
  avatarStyle: AvatarStyle
  rarity: Rarity
  accentColor: string
  mintPrice: number
  perUseFee: number
  supply: 'unlimited' | 'limited'
  maxSupply: number
}

const defaultForm: AgentForm = {
  name: '', category: '', description: '', tags: [],
  systemPrompt: '', traits: { friendly: 50, creative: 50, verbose: 50, cautious: 50 },
  commStyle: 'Professional', languages: ['English'], skills: [], accessLevel: 'basic',
  knowledgeUrls: [], knowledgeText: '',
  avatarStyle: 'golden-holographic', rarity: 'common', accentColor: '',
  mintPrice: 1.0, perUseFee: 0.002, supply: 'unlimited', maxSupply: 100,
}

const STEPS = [
  { icon: User, label: 'Identity' },
  { icon: Brain, label: 'Personality' },
  { icon: Zap, label: 'Skills & Tools' },
  { icon: Palette, label: 'Visual Identity' },
  { icon: DollarSign, label: 'Pricing' },
  { icon: FileCheck, label: 'Review & Mint' },
]

export default function CreatePage() {
  const router = useRouter()
  const { addToast, updateToast } = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<AgentForm>(defaultForm)
  const [tagInput, setTagInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [minting, setMinting] = useState(false)
  const [minted, setMinted] = useState(false)
  const [mintSig, setMintSig] = useState('')

  const update = <K extends keyof AgentForm>(key: K, val: AgentForm[K]) => setForm(f => ({ ...f, [key]: val }))

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update('tags', [...form.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const addUrl = () => {
    if (urlInput.trim()) {
      update('knowledgeUrls', [...form.knowledgeUrls, urlInput.trim()])
      setUrlInput('')
    }
  }

  const toggleSkill = (id: string) => {
    update('skills', form.skills.includes(id) ? form.skills.filter(s => s !== id) : [...form.skills, id])
  }

  const toggleLang = (lang: string) => {
    update('languages', form.languages.includes(lang) ? form.languages.filter(l => l !== lang) : [...form.languages, lang])
  }

  const suggestedRange = PRICE_RANGES[form.category as string] || [1, 5]

  const estimatedMonthly = () => {
    const avgUses = form.accessLevel === 'unlimited' ? 5000 : form.accessLevel === 'advanced' ? 3000 : form.accessLevel === 'standard' ? 2000 : 1000
    return (avgUses * form.perUseFee * 0.7).toFixed(1)
  }

  const handleMint = () => {
    setMinting(true)
    const toastId = addToast({ type: 'loading', message: 'Minting NFA on Solana...', duration: 0 })
    setTimeout(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let sig = ''
      for (let i = 0; i < 88; i++) sig += chars[Math.floor(Math.random() * chars.length)]
      setMintSig(sig)
      setMinted(true)
      setMinting(false)

      // Save to localStorage
      const created = JSON.parse(localStorage.getItem('createdNFAs') || '[]')
      created.push({ ...form, id: `custom-${Date.now()}`, txSignature: sig, createdAt: new Date().toISOString() })
      localStorage.setItem('createdNFAs', JSON.stringify(created))

      updateToast(toastId, { type: 'success', message: 'NFA minted successfully!', txSignature: sig })
    }, 2500)
  }

  const canProceed = () => {
    switch (step) {
      case 0: return form.name && form.category && form.description
      case 1: return form.systemPrompt.length > 20
      case 2: return form.skills.length > 0
      case 3: return true
      case 4: return form.mintPrice > 0 && form.perUseFee > 0
      default: return true
    }
  }

  const styleObj = AVATAR_STYLES[form.avatarStyle]
  const rarityObj = RARITY_CONFIG[form.rarity]

  const steps = [
    // ── Step 0: Identity ──
    <motion.div key="identity" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Agent Identity</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">Define who your agent is.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Agent Name</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Alpha Hunter, Thread King" className="elite-input w-full" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat] || Brain
              return (
                <button key={cat} onClick={() => update('category', cat)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                    form.category === cat
                      ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25'
                      : 'bg-white/[0.02] text-white/30 border border-white/[0.06] hover:text-white/45'
                  }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cat}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            placeholder="What does your agent do? What makes it special? (2-3 sentences)"
            rows={3} className="elite-input w-full resize-none" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">
            Tags <span className="text-white/15 normal-case">(for marketplace discovery)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..." className="elite-input flex-1" />
            <button onClick={addTag} className="px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/30 hover:text-white/50 cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/[0.08] border border-amber-500/15 text-[11px] text-amber-300/60">
                {tag}
                <button onClick={() => update('tags', form.tags.filter(t => t !== tag))} className="text-amber-300/30 hover:text-amber-300/60 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>,

    // ── Step 1: Personality ──
    <motion.div key="personality" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Personality & Capabilities</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">Define how your agent thinks and communicates.</p>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12px] font-medium text-white/25 uppercase tracking-wider">System Prompt</label>
            <span className="text-[10px] text-white/20">{form.systemPrompt.length} / 2000</span>
          </div>
          <textarea value={form.systemPrompt} onChange={e => update('systemPrompt', e.target.value.slice(0, 2000))}
            placeholder="You are [Agent Name], a specialized AI agent that... Define personality, expertise, tone, and behavior."
            rows={6} className="elite-input w-full resize-none font-mono text-[12px]" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">Personality Traits</label>
          <div className="space-y-4">
            {([
              ['friendly', 'Friendly', 'Formal'],
              ['creative', 'Creative', 'Analytical'],
              ['verbose', 'Verbose', 'Concise'],
              ['cautious', 'Cautious', 'Bold'],
            ] as const).map(([key, left, right]) => (
              <div key={key}>
                <div className="flex justify-between text-[10px] text-white/25 mb-1.5">
                  <span>{left}</span>
                  <span>{right}</span>
                </div>
                <input type="range" min={0} max={100}
                  value={form.traits[key]}
                  onChange={e => update('traits', { ...form.traits, [key]: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Communication Style</label>
          <div className="flex flex-wrap gap-2">
            {COMMUNICATION_STYLES.map(s => (
              <button key={s} onClick={() => update('commStyle', s)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                  form.commStyle === s
                    ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25'
                    : 'bg-white/[0.02] text-white/30 border border-white/[0.06] hover:text-white/45'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Language Support</label>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map(lang => (
              <button key={lang} onClick={() => toggleLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  form.languages.includes(lang)
                    ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25'
                    : 'bg-white/[0.02] text-white/25 border border-white/[0.06] hover:text-white/40'
                }`}>
                {form.languages.includes(lang) && <Check className="w-2.5 h-2.5 inline mr-1" />}
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>,

    // ── Step 2: Skills & Tools ──
    <motion.div key="skills" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Skills & Tools</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">What can your agent do? This is the key differentiator.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">Skill Categories</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SKILL_CATEGORIES.map(skill => (
              <button key={skill.id} onClick={() => toggleSkill(skill.id)}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  form.skills.includes(skill.id)
                    ? 'bg-amber-500/[0.08] border border-amber-500/20'
                    : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03]'
                }`}>
                <span className="text-lg mt-0.5">{skill.icon}</span>
                <div>
                  <p className={`text-[12px] font-medium ${form.skills.includes(skill.id) ? 'text-amber-300/70' : 'text-white/40'}`}>
                    {skill.label}
                  </p>
                  <p className="text-[10px] text-white/20">{skill.desc}</p>
                </div>
                {form.skills.includes(skill.id) && (
                  <Check className="w-3.5 h-3.5 text-amber-400/50 ml-auto mt-1 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">Access Level</label>
          <div className="space-y-2">
            {ACCESS_LEVELS.map(level => (
              <button key={level.id} onClick={() => update('accessLevel', level.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  form.accessLevel === level.id
                    ? 'bg-amber-500/[0.08] border border-amber-500/20'
                    : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03]'
                }`}>
                <span className="text-lg">{level.icon}</span>
                <div className="flex-1">
                  <p className={`text-[12px] font-medium ${form.accessLevel === level.id ? 'text-amber-300/70' : 'text-white/40'}`}>
                    {level.label}
                  </p>
                  <p className="text-[10px] text-white/20">{level.desc}</p>
                </div>
                {form.accessLevel === level.id && <Check className="w-3.5 h-3.5 text-amber-400/50 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">
            Knowledge Base <span className="text-white/15 normal-case">(optional)</span>
          </label>

          {/* Upload mock */}
          <div className="border border-dashed border-white/[0.08] rounded-xl p-6 text-center mb-3 hover:border-amber-500/20 transition-all cursor-pointer group">
            <Upload className="w-5 h-5 text-white/10 mx-auto mb-2 group-hover:text-amber-400/30 transition-colors" />
            <p className="text-[11px] text-white/25">Drag & drop documents or click to upload</p>
            <p className="text-[9px] text-white/15 mt-1">PDF, TXT, MD up to 10MB</p>
          </div>

          {/* URLs */}
          <div className="flex gap-2 mb-2">
            <input value={urlInput} onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="Add reference URL..." className="elite-input flex-1 text-[12px]" />
            <button onClick={addUrl} className="px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/30 hover:text-white/50 cursor-pointer">
              <Link2 className="w-4 h-4" />
            </button>
          </div>
          {form.knowledgeUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-white/30 mb-1">
              <Link2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{url}</span>
              <button onClick={() => update('knowledgeUrls', form.knowledgeUrls.filter((_, j) => j !== i))} className="text-white/15 hover:text-white/40 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Custom knowledge */}
          <textarea value={form.knowledgeText} onChange={e => update('knowledgeText', e.target.value)}
            placeholder="Paste custom knowledge or context..."
            rows={3} className="elite-input w-full resize-none text-[12px] mt-2" />
        </div>
      </div>
    </motion.div>,

    // ── Step 3: Visual Identity ──
    <motion.div key="visual" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Visual Identity</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">How your agent looks on the marketplace.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">Avatar Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(AVATAR_STYLES) as [AvatarStyle, typeof AVATAR_STYLES[AvatarStyle]][]).map(([key, style]) => (
              <button key={key} onClick={() => update('avatarStyle', key)}
                className={`relative rounded-2xl overflow-hidden transition-all cursor-pointer ${
                  form.avatarStyle === key
                    ? 'ring-2 ring-amber-500/40 scale-[1.02]'
                    : 'hover:scale-[1.01] opacity-70 hover:opacity-100'
                }`}>
                <div className={`h-28 ${style.bgPattern} flex items-center justify-center`}>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center ${style.borderGlow}`}>
                    <span className="text-2xl font-bold text-white/80">
                      {form.name ? form.name.charAt(0) : 'A'}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-2 bg-white/[0.02] border-t border-white/[0.04]">
                  <p className="text-[11px] font-medium text-white/50">{style.label}</p>
                </div>
                {form.avatarStyle === key && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500/80 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">Rarity</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.entries(RARITY_CONFIG) as [Rarity, typeof RARITY_CONFIG[Rarity]][]).map(([key, config]) => (
              <button key={key} onClick={() => update('rarity', key)}
                className={`px-4 py-3 rounded-xl text-center transition-all cursor-pointer ${
                  form.rarity === key
                    ? `${config.bg} ${config.border} border`
                    : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03]'
                }`}>
                <p className={`text-[12px] font-semibold ${form.rarity === key ? config.color : 'text-white/40'}`}>
                  {config.label}
                </p>
                {key === 'legendary' && form.rarity === key && (
                  <p className="text-[9px] text-amber-400/40 mt-0.5">✨ Shimmer effect</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-3">Preview</label>
          <div className="max-w-xs mx-auto">
            <div className={`rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] ${
              form.rarity === 'legendary' ? 'ring-1 ring-amber-400/20' : ''
            }`}>
              <div className={`h-24 ${styleObj.bgPattern} flex items-center justify-center relative`}>
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${styleObj.gradient} flex items-center justify-center ${styleObj.borderGlow}`}>
                  <span className="text-xl font-bold text-white/80">{form.name ? form.name.charAt(0) : '?'}</span>
                </div>
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-semibold ${rarityObj.color} ${rarityObj.bg} border ${rarityObj.border}`}>
                  {rarityObj.label}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-[14px] font-semibold text-white/80">{form.name || 'Agent Name'}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/30">
                  {form.category || 'Category'}
                </span>
                <p className="text-[11px] text-white/25 mt-2 line-clamp-2">{form.description || 'Agent description...'}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                  <span className="text-[14px] font-bold text-white/70">{form.mintPrice} SOL</span>
                  <span className="text-[10px] text-amber-300/50 px-2 py-1 rounded-lg bg-amber-500/[0.08]">Buy Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,

    // ── Step 4: Pricing ──
    <motion.div key="pricing" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
      <h2 className="text-xl font-bold gradient-text-white mb-1">Pricing & Listing</h2>
      <p className="text-white/40 text-[13px] mb-8 font-light">Set your pricing strategy.</p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Mint Price (SOL)</label>
            <input type="number" value={form.mintPrice} onChange={e => update('mintPrice', parseFloat(e.target.value) || 0)}
              step="0.1" min="0.1" className="elite-input w-full" />
            <p className="text-[9px] text-white/15 mt-1">Suggested: {suggestedRange[0]}–{suggestedRange[1]} SOL</p>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Per-Use Fee (SOL)</label>
            <input type="number" value={form.perUseFee} onChange={e => update('perUseFee', parseFloat(e.target.value) || 0)}
              step="0.001" min="0.001" className="elite-input w-full" />
            <p className="text-[9px] text-white/15 mt-1">Suggested: 0.001–0.01 SOL</p>
          </div>
        </div>

        {/* Revenue Split */}
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
          <p className="text-[12px] font-medium text-white/30 mb-3">Revenue Split</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full overflow-hidden flex">
              <div className="w-[70%] bg-amber-500/40 rounded-l-full" />
              <div className="w-[20%] bg-purple-500/40" />
              <div className="w-[10%] bg-cyan-500/40 rounded-r-full" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px]">
            <span className="text-amber-300/50">70% Owner</span>
            <span className="text-purple-300/50">20% Creator</span>
            <span className="text-cyan-300/50">10% Platform</span>
          </div>
        </div>

        {/* Supply */}
        <div>
          <label className="block text-[12px] font-medium text-white/25 uppercase tracking-wider mb-2">Supply</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => update('supply', 'unlimited')}
              className={`px-4 py-3 rounded-xl text-center transition-all cursor-pointer ${
                form.supply === 'unlimited'
                  ? 'bg-amber-500/[0.08] border border-amber-500/20 text-amber-300/70'
                  : 'bg-white/[0.02] border border-white/[0.06] text-white/30'
              }`}>
              <p className="text-[12px] font-medium">♾️ Unlimited</p>
              <p className="text-[9px] text-white/20 mt-0.5">No cap on mints</p>
            </button>
            <button onClick={() => update('supply', 'limited')}
              className={`px-4 py-3 rounded-xl text-center transition-all cursor-pointer ${
                form.supply === 'limited'
                  ? 'bg-amber-500/[0.08] border border-amber-500/20 text-amber-300/70'
                  : 'bg-white/[0.02] border border-white/[0.06] text-white/30'
              }`}>
              <p className="text-[12px] font-medium">🔒 Limited Edition</p>
              <p className="text-[9px] text-white/20 mt-0.5">Scarce = valuable</p>
            </button>
          </div>
          {form.supply === 'limited' && (
            <div className="mt-3">
              <label className="block text-[10px] text-white/25 mb-1">Max Supply</label>
              <input type="number" value={form.maxSupply} onChange={e => update('maxSupply', parseInt(e.target.value) || 1)}
                min={1} className="elite-input w-32" />
            </div>
          )}
        </div>

        {/* Estimated earnings */}
        <div className="rounded-xl bg-gradient-to-br from-amber-500/[0.04] to-transparent border border-amber-500/10 p-4">
          <p className="text-[12px] font-medium text-amber-300/50 mb-1">💰 Estimated Monthly Earnings</p>
          <p className="text-2xl font-bold text-white/70">{estimatedMonthly()} SOL</p>
          <p className="text-[10px] text-white/20 mt-1">Based on projected usage for {form.accessLevel} tier agents (your 70% share)</p>
        </div>
      </div>
    </motion.div>,

    // ── Step 5: Review & Mint ──
    <motion.div key="review" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
      {!minted ? (
        <>
          <h2 className="text-xl font-bold gradient-text-white mb-1">Review & Mint</h2>
          <p className="text-white/40 text-[13px] mb-8 font-light">Everything look right? Let&apos;s mint your NFA.</p>

          <div className="space-y-4">
            {/* Agent Preview Card */}
            <div className={`rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] ${
              form.rarity === 'legendary' ? 'ring-1 ring-amber-400/20' : ''
            }`}>
              <div className={`h-20 ${styleObj.bgPattern} flex items-center gap-4 px-5 relative`}>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${styleObj.gradient} flex items-center justify-center ${styleObj.borderGlow} shrink-0`}>
                  <span className="text-lg font-bold text-white/80">{form.name.charAt(0) || '?'}</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-white/80">{form.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30">{form.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${rarityObj.bg} ${rarityObj.color} border ${rarityObj.border}`}>{rarityObj.label}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-[11px] text-white/30 leading-relaxed">{form.description}</p>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <p className="text-white/20 uppercase tracking-wider mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {form.skills.map(s => {
                        const skill = SKILL_CATEGORIES.find(sc => sc.id === s)
                        return <span key={s} className="px-2 py-0.5 rounded bg-white/[0.04] text-white/30">{skill?.icon} {skill?.label}</span>
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/20 uppercase tracking-wider mb-1">Access</p>
                    <p className="text-white/40">{ACCESS_LEVELS.find(l => l.id === form.accessLevel)?.icon} {ACCESS_LEVELS.find(l => l.id === form.accessLevel)?.label}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <div>
                    <span className="text-[16px] font-bold text-white/70">{form.mintPrice} SOL</span>
                    <span className="text-[10px] text-white/20 ml-2">{form.perUseFee} SOL/use</span>
                  </div>
                  <div className="text-[10px] text-white/20">
                    {form.supply === 'limited' ? `Limited: ${form.maxSupply}` : '♾️ Unlimited'}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-2 text-[11px]">
              <div className="flex justify-between"><span className="text-white/25">Style</span><span className="text-white/45">{styleObj.label}</span></div>
              <div className="flex justify-between"><span className="text-white/25">Communication</span><span className="text-white/45">{form.commStyle}</span></div>
              <div className="flex justify-between"><span className="text-white/25">Languages</span><span className="text-white/45">{form.languages.join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-white/25">System Prompt</span><span className="text-white/45">{form.systemPrompt.length} chars</span></div>
              {form.knowledgeUrls.length > 0 && (
                <div className="flex justify-between"><span className="text-white/25">Knowledge URLs</span><span className="text-white/45">{form.knowledgeUrls.length}</span></div>
              )}
            </div>

            <button onClick={handleMint} disabled={minting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[14px] btn-glow hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2">
              {minting ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" /> Minting on Solana...</>
              ) : (
                <><Sparkles className="w-4 h-4 opacity-60" /> Mint & List on Marketplace</>
              )}
            </button>
          </div>
        </>
      ) : (
        /* Success screen */
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}>
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${styleObj.gradient} flex items-center justify-center mx-auto mb-6 ${styleObj.borderGlow}`}>
              <span className="text-3xl font-bold text-white/80">{form.name.charAt(0)}</span>
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold gradient-text-white mb-3">NFA Minted! 🎉</h2>
          <p className="text-white/40 text-[13px] mb-6 font-light max-w-sm mx-auto">
            <strong className="text-white/60">{form.name}</strong> is now live on the NFA Marketplace.
          </p>

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 mb-6 max-w-md mx-auto">
            <p className="text-[10px] text-emerald-400/50 uppercase tracking-wider mb-1">✅ Transaction Confirmed</p>
            <p className="text-amber-300/50 font-mono text-[10px] break-all">{mintSig}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/marketplace')}
              className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-all cursor-pointer">
              View on Marketplace <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </button>
            <button onClick={() => { setStep(0); setForm(defaultForm); setMinted(false); setMintSig('') }}
              className="px-7 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/30 font-medium text-[13px] hover:text-white/50 transition-all cursor-pointer">
              Create Another
            </button>
          </div>
        </div>
      )}
    </motion.div>,
  ]

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Step indicator */}
        {!minted && (
          <div className="flex items-center gap-2 mb-10 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`flex items-center gap-1.5 transition-all duration-500 ${i <= step ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ${
                    i < step ? 'bg-amber-500/[0.1] border border-amber-500/25'
                      : i === step ? 'bg-gradient-to-br from-amber-600 to-amber-500 shadow-[0_0_25px_rgba(212,160,23,0.1)]'
                        : 'bg-white/[0.02] border border-white/[0.08]'
                  }`}>
                    {i < step ? <Check className="w-3 h-3 text-amber-300/60" /> : <s.icon className="w-3 h-3 text-white/50" />}
                  </div>
                  <span className="text-[10px] text-white/40 hidden sm:block whitespace-nowrap">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px min-w-[12px] transition-all duration-500 ${i < step ? 'bg-amber-500/[0.2]' : 'bg-white/[0.03]'}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>

        {/* Navigation */}
        {!minted && (
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/25 hover:text-white/50 transition-all cursor-pointer ${step === 0 ? 'invisible' : ''}`}>
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
            {step < 5 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] disabled:opacity-20 hover:scale-[1.02] transition-all cursor-pointer">
                Continue <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
