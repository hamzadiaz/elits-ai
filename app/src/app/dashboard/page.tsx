'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { type PersonalityProfile } from '@/lib/personality'
import { Avatar3D } from '@/components/Avatar3D'
import { getConnection, getProvider, getProgram, delegateOnChain, revokeElitOnChain, explorerUrl, PublicKey } from '@/lib/solana'
import {
  Wallet, Zap, MessageSquare, ShieldCheck, Mic, Brain, ChevronRight,
  Activity, Clock, Twitter, Code, Mail, Search,
  Play, CheckCircle, XCircle, Shield, Plus, Eye, Power, ExternalLink, Loader2, Trophy
} from 'lucide-react'
import { XPBar } from '@/components/XPBar'
import { LevelBadge } from '@/components/LevelBadge'
import { CapabilityChart } from '@/components/CapabilityChart'
import { useToast } from '@/components/Toast'
import { calculateXP, calculateCapabilities, getUnlockedMilestones, type AgentStats } from '@/lib/xp'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

type ActionType = 'post_tweet' | 'write_code' | 'respond_message' | 'research'

interface Action {
  id: string; type: ActionType; prompt: string; result: string
  status: 'pending' | 'completed' | 'failed'; timestamp: string
}

interface Delegation {
  id: string; scopes: string[]; expiresAt: string; restrictions: string
  active: boolean; createdAt: string
}

const ACTION_ICONS: Record<ActionType, typeof Twitter> = {
  post_tweet: Twitter, write_code: Code, respond_message: Mail, research: Search
}
const ACTION_LABELS: Record<ActionType, string> = {
  post_tweet: 'Post Tweet', write_code: 'Write Code', respond_message: 'Respond', research: 'Research'
}

export default function DashboardPage() {
  const { connected, publicKey, signTransaction, signAllTransactions } = useWallet()
  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [hash, setHash] = useState('')
  const [tab, setTab] = useState<'overview' | 'actions' | 'delegations'>('overview')
  const [actions, setActions] = useState<Action[]>([])
  const [delegations, setDelegations] = useState<Delegation[]>([
    { id: 'del-1', scopes: ['chat', 'post'], expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), restrictions: 'No controversial topics', active: true, createdAt: new Date().toISOString() },
    { id: 'del-2', scopes: ['code', 'research'], expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), restrictions: '', active: true, createdAt: new Date().toISOString() },
  ])
  const [actionType, setActionType] = useState<ActionType>('post_tweet')
  const [actionPrompt, setActionPrompt] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showNewDelegation, setShowNewDelegation] = useState(false)
  const [newScopes, setNewScopes] = useState<string[]>([])
  const [newExpiry, setNewExpiry] = useState('7')
  const [newRestrictions, setNewRestrictions] = useState('')
  const [killSwitchConfirm, setKillSwitchConfirm] = useState(false)
  const [txPending, setTxPending] = useState(false)
  const [lastTxSig, setLastTxSig] = useState('')
  const [txError, setTxError] = useState('')

  const { addToast, updateToast } = useToast()
  const [agentXP, setAgentXP] = useState(0)
  const [capabilities, setCapabilities] = useState<AgentStats['capabilities']>({ knowledge: 0, communication: 0, actions: 0, trust: 0, creativity: 0 })
  const [milestones, setMilestones] = useState<ReturnType<typeof getUnlockedMilestones>>([])

  useEffect(() => {
    const stored = localStorage.getItem('elitProfile')
    const storedHash = localStorage.getItem('elitHash')
    const storedActions = localStorage.getItem('elitActions')
    if (stored) try { setProfile(JSON.parse(stored)) } catch {}
    if (storedHash) setHash(storedHash)
    if (storedActions) try { setActions(JSON.parse(storedActions)) } catch {}
  }, [])

  // Calculate XP and capabilities when profile changes
  useEffect(() => {
    if (profile) {
      const xp = calculateXP(profile)
      setAgentXP(xp)
      setCapabilities(calculateCapabilities(profile))
      setMilestones(getUnlockedMilestones(xp, profile))
    }
  }, [profile, actions])

  const executeAction = async () => {
    if (!actionPrompt.trim() || !profile) return
    setIsExecuting(true)
    const systemPrompt = localStorage.getItem('elitSystemPrompt') || ''
    try {
      const res = await fetch('/api/actions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actionType, prompt: actionPrompt, systemPrompt, delegationScopes: ['chat', 'post', 'code', 'research', 'full'] }),
      })
      const data = await res.json()
      const newAction: Action = { ...data, prompt: actionPrompt }
      const updated = [newAction, ...actions]
      setActions(updated)
      localStorage.setItem('elitActions', JSON.stringify(updated))
      // Track action count for XP
      const count = parseInt(localStorage.getItem('elitActionCount') || '0') + 1
      localStorage.setItem('elitActionCount', count.toString())
      setActionPrompt('')
    } catch (err) { console.error(err) }
    setIsExecuting(false)
  }

  const revokeDelegation = (id: string) => setDelegations(prev => prev.map(d => d.id === id ? { ...d, active: false } : d))

  const createDelegation = async () => {
    if (newScopes.length === 0) return
    setTxPending(true)
    setTxError('')
    const del: Delegation = {
      id: `del-${Date.now()}`, scopes: newScopes,
      expiresAt: new Date(Date.now() + parseInt(newExpiry) * 86400000).toISOString(),
      restrictions: newRestrictions, active: true, createdAt: new Date().toISOString(),
    }

    // Try on-chain delegation
    if (publicKey && signTransaction && signAllTransactions) {
      const toastId = addToast({ type: 'loading', message: 'Creating delegation on Solana...', duration: 0 })
      try {
        const connection = getConnection()
        const provider = getProvider(connection, { publicKey, signTransaction, signAllTransactions } as never)
        const program = getProgram(provider)
        // Use a deterministic delegate address (self-delegation for demo)
        const delegateAddr = PublicKey.unique()
        const expiresAt = Math.floor(Date.now() / 1000) + parseInt(newExpiry) * 86400
        const sig = await delegateOnChain(program, publicKey, delegateAddr, newScopes.join(','), expiresAt, newRestrictions)
        setLastTxSig(sig)
        del.id = sig.slice(0, 12)
        updateToast(toastId, { type: 'success', message: 'Delegation created on-chain!', txSignature: sig })
      } catch (err) {
        console.error('On-chain delegation failed:', err)
        setTxError('On-chain delegation failed. Saved locally.')
        updateToast(toastId, { type: 'error', message: 'On-chain delegation failed' })
      }
    }

    setDelegations(prev => [del, ...prev])
    setShowNewDelegation(false); setNewScopes([]); setNewRestrictions('')
    setTxPending(false)
  }

  const killSwitch = async () => {
    setTxPending(true)
    setTxError('')

    if (publicKey && signTransaction && signAllTransactions) {
      const toastId = addToast({ type: 'loading', message: 'Revoking Elit on Solana...', duration: 0 })
      try {
        const connection = getConnection()
        const provider = getProvider(connection, { publicKey, signTransaction, signAllTransactions } as never)
        const program = getProgram(provider)
        const sig = await revokeElitOnChain(program, publicKey)
        setLastTxSig(sig)
        updateToast(toastId, { type: 'success', message: 'Elit revoked on-chain', txSignature: sig })
      } catch (err) {
        console.error('On-chain revoke failed:', err)
        setTxError('On-chain revoke failed.')
        updateToast(toastId, { type: 'error', message: 'On-chain revoke failed' })
      }
    }

    setDelegations(prev => prev.map(d => ({ ...d, active: false })))
    setKillSwitchConfirm(false)
    setTxPending(false)
  }

  if (!connected) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-7 h-7 text-amber-300/40" />
          </div>
          <h1 className="text-2xl font-bold gradient-text-white mb-3">Dashboard</h1>
          <p className="text-white/45 mb-8 text-[13px] font-light">Connect your wallet to manage your Elit.</p>
          <WalletMultiButton style={{ background: 'rgba(212, 160, 23, 0.15)', border: '0.5px solid rgba(212, 160, 23, 0.25)', borderRadius: '14px', fontSize: '13px', fontWeight: '500', height: '44px', color: '#f0c940' }} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial="initial" animate="animate" transition={{ staggerChildren: 0.05 }}>
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-xl font-bold gradient-text-white mb-1">Dashboard</h1>
          <p className="text-white/40 text-[13px] font-light">Manage your Elit, execute actions, and control delegations.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex gap-0.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6 w-fit">
          {(['overview', 'actions', 'delegations'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-[11px] font-medium transition-all duration-300 capitalize cursor-pointer ${
                tab === t ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25' : 'text-white/45 hover:text-white/35'
              }`}
            >{t}</button>
          ))}
        </motion.div>

        {profile ? (
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Profile + XP */}
                <motion.div variants={fadeUp} className="elite-card rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Avatar3D avatarUrl={profile.avatarUrl} name={profile.name} size="md" />
                      <div className="absolute -bottom-1 -right-1">
                        <LevelBadge xp={agentXP} size="sm" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-white/90">{profile.name}&apos;s Elit</h2>
                        <LevelBadge xp={agentXP} size="sm" showTier />
                      </div>
                      <p className="text-[13px] text-white/45 mt-0.5 line-clamp-1 font-light">{profile.bio}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
                        </span>
                        <span className="text-[11px] text-emerald-400/60 font-medium">Active</span>
                        <span className="text-[11px] text-white/10">·</span>
                        <span className="text-[11px] text-white/40 font-mono">{publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}</span>
                      </div>
                    </div>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="mb-5">
                    <XPBar xp={agentXP} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Skills', value: profile.skills.length.toString(), icon: Zap, color: 'text-amber-300/50' },
                      { label: 'Actions', value: actions.length.toString(), icon: Activity, color: 'text-amber-300/40' },
                      { label: 'Delegations', value: delegations.filter(d => d.active).length.toString(), icon: Shield, color: 'text-amber-300/40' },
                      { label: 'Status', value: hash ? 'Verified' : 'Pending', icon: ShieldCheck, color: hash ? 'text-emerald-400/50' : 'text-amber-400/50' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 hover:border-white/[0.05] transition-all duration-500">
                        <stat.icon className={`w-4 h-4 ${stat.color} mb-3`} />
                        <div className="text-lg font-bold text-white/80">{stat.value}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Capability Chart + Milestones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={fadeUp} className="elite-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-3.5 h-3.5 text-amber-300/40" />
                      <h3 className="text-[13px] font-medium text-white/60">Agent Capabilities</h3>
                    </div>
                    <CapabilityChart capabilities={capabilities} size={160} />
                  </motion.div>

                  <motion.div variants={fadeUp} className="elite-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-3.5 h-3.5 text-amber-300/40" />
                      <h3 className="text-[13px] font-medium text-white/60">Milestones</h3>
                      <span className="text-[10px] text-white/20 ml-auto">{milestones.length}/9</span>
                    </div>
                    <div className="space-y-2">
                      {milestones.length > 0 ? milestones.slice(0, 5).map(m => (
                        <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.03]">
                          <span className="text-sm">{m.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-white/50">{m.name}</p>
                            <p className="text-[9px] text-white/25">{m.description}</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-[12px] text-white/20 py-6">Train your Elit to unlock milestones</p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {hash && (
                  <motion.div variants={fadeUp} className="elite-card rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-3.5 h-3.5 text-amber-300/40" />
                      <h3 className="text-[13px] font-medium text-white/60">Personality Hash</h3>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] p-4 rounded-xl">
                      <p className="font-mono text-[11px] text-amber-300/30 break-all">{hash}</p>
                    </div>
                  </motion.div>
                )}

                {/* Quick actions */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { href: '/train', icon: Mic, title: 'Train', desc: 'Chat or voice' },
                    { href: '/chat/default', icon: MessageSquare, title: 'Chat', desc: 'Test your agent' },
                    { href: '/verify/default', icon: ShieldCheck, title: 'Verify', desc: 'On-chain proof' },
                    { href: '/turing', icon: Eye, title: 'Turing Test', desc: 'Real vs AI' },
                    { href: '/explore', icon: Activity, title: 'Explore', desc: 'Agent marketplace' },
                  ].map(action => (
                    <Link key={action.href} href={action.href} className="group elite-card rounded-2xl p-5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mb-3 group-hover:bg-amber-500/[0.1] group-hover:border-amber-500/25 group-hover:scale-105 transition-all duration-500">
                        <action.icon className="w-3.5 h-3.5 text-amber-300/40" />
                      </div>
                      <h3 className="font-medium text-white/70 text-[13px] mb-0.5 group-hover:text-white/90 transition-colors duration-500">{action.title}</h3>
                      <p className="text-[11px] text-white/40 font-light">{action.desc}</p>
                    </Link>
                  ))}
                </motion.div>

                {actions.length > 0 && (
                  <motion.div variants={fadeUp} className="elite-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-amber-300/30" />
                        <h3 className="text-[13px] font-medium text-white/60">Recent Actions</h3>
                      </div>
                      <button onClick={() => setTab('actions')} className="text-[11px] text-amber-300/30 hover:text-amber-300/50 transition-colors cursor-pointer">View all →</button>
                    </div>
                    <div className="space-y-2">
                      {actions.slice(0, 3).map(action => {
                        const Icon = ACTION_ICONS[action.type]
                        return (
                          <div key={action.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                            <Icon className="w-3.5 h-3.5 text-amber-300/30 shrink-0" />
                            <span className="text-[12px] text-white/30 flex-1 truncate font-light">{action.prompt}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              action.status === 'completed' ? 'bg-emerald-400/[0.06] text-emerald-400/50' : 'bg-amber-400/[0.06] text-amber-400/50'
                            }`}>{action.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {tab === 'actions' && (
              <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="elite-card rounded-2xl p-6">
                  <h3 className="text-[13px] font-medium text-white/60 mb-4 flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-amber-300/30" /> Execute Action
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {(Object.keys(ACTION_LABELS) as ActionType[]).map(type => {
                      const Icon = ACTION_ICONS[type]
                      return (
                        <button key={type} onClick={() => setActionType(type)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-[11px] font-medium transition-all duration-300 cursor-pointer ${
                            actionType === type
                              ? 'border-amber-500/25 bg-amber-500/[0.06] text-amber-300/60'
                              : 'border-white/[0.06] bg-white/[0.03] text-white/45 hover:border-white/[0.06]'
                          }`}
                        >
                          <Icon className="w-3 h-3" /> {ACTION_LABELS[type]}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input value={actionPrompt} onChange={e => setActionPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && executeAction()}
                      placeholder="What should your Elit do?" className="elite-input flex-1" />
                    <button onClick={executeAction} disabled={isExecuting || !actionPrompt.trim()}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] hover:scale-[1.02] transition-all disabled:opacity-30 cursor-pointer">
                      {isExecuting ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="elite-card rounded-2xl p-5">
                  <h3 className="text-[13px] font-medium text-white/60 mb-4 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-300/30" /> Action History
                  </h3>
                  {actions.length === 0 ? (
                    <p className="text-center text-white/40 text-[13px] py-8 font-light">No actions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {actions.map(action => {
                        const Icon = ACTION_ICONS[action.type]
                        return (
                          <motion.div key={action.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className="w-3.5 h-3.5 text-amber-300/30" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-medium text-white/50">{ACTION_LABELS[action.type]}</span>
                                <p className="text-[11px] text-white/40 truncate font-light">{action.prompt}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {action.status === 'completed' ? <CheckCircle className="w-3 h-3 text-emerald-400/40" /> : action.status === 'failed' ? <XCircle className="w-3 h-3 text-red-400/40" /> : <div className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400/60 rounded-full animate-spin" />}
                                <span className="text-[10px] text-white/10">{new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            {action.result && (
                              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                                <p className="text-[11px] text-white/25 whitespace-pre-wrap leading-relaxed font-light">{action.result}</p>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'delegations' && (
              <motion.div key="delegations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <button onClick={() => setShowNewDelegation(!showNewDelegation)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/[0.06] text-amber-300/50 border border-amber-500/20 text-[11px] font-medium hover:bg-amber-500/[0.1] transition-all cursor-pointer">
                  <Plus className="w-3 h-3" /> New Delegation
                </button>

                <AnimatePresence>
                  {showNewDelegation && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="elite-card rounded-2xl p-5 overflow-hidden">
                      <h3 className="text-[13px] font-medium text-white/60 mb-4">Create Delegation</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] text-white/40 mb-2 block uppercase tracking-wider">Scopes</label>
                          <div className="flex flex-wrap gap-1.5">
                            {['chat', 'post', 'code', 'research', 'full'].map(scope => (
                              <button key={scope} onClick={() => setNewScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope])}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all capitalize cursor-pointer ${
                                  newScopes.includes(scope) ? 'border-amber-500/30 bg-amber-500/[0.08] text-amber-300/60' : 'border-white/[0.08] bg-white/[0.04] text-white/45 hover:border-white/[0.08]'
                                }`}>{scope}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 mb-2 block uppercase tracking-wider">Expires in</label>
                          <select value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="elite-input w-full">
                            <option value="1">1 day</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="365">1 year</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-white/40 mb-2 block uppercase tracking-wider">Restrictions (optional)</label>
                          <input value={newRestrictions} onChange={e => setNewRestrictions(e.target.value)} placeholder="e.g. No controversial topics" className="elite-input w-full" />
                        </div>
                        <button onClick={createDelegation} disabled={newScopes.length === 0}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[12px] hover:scale-[1.02] transition-all disabled:opacity-30 cursor-pointer">
                          Create Delegation
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="elite-card rounded-2xl p-5">
                  <h3 className="text-[13px] font-medium text-white/60 mb-4 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-300/30" /> Active Delegations
                  </h3>
                  <div className="space-y-3">
                    {delegations.map(del => (
                      <motion.div key={del.id} layout className={`rounded-xl border p-4 transition-all duration-500 ${
                        del.active ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-red-500/[0.01] border-red-500/[0.06] opacity-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-wrap gap-1">
                            {del.scopes.map(scope => (
                              <span key={scope} className="px-2 py-0.5 rounded-md bg-amber-500/[0.06] text-amber-300/40 text-[10px] border border-amber-500/15 font-medium capitalize">{scope}</span>
                            ))}
                          </div>
                          {del.active ? (
                            <button onClick={() => revokeDelegation(del.id)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/[0.06] text-red-400/50 border border-red-500/[0.1] text-[10px] font-medium hover:bg-red-500/[0.1] transition-all cursor-pointer">
                              <XCircle className="w-2.5 h-2.5" /> Revoke
                            </button>
                          ) : <span className="text-[10px] text-red-400/30">Revoked</span>}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-white/40">
                          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Expires {new Date(del.expiresAt).toLocaleDateString()}</span>
                          {del.restrictions && <span>· {del.restrictions}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Kill Switch */}
                <div className="rounded-2xl p-6 bg-red-500/[0.02] border border-red-500/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <Power className="w-4 h-4 text-red-400/40" />
                    <h3 className="text-[14px] font-medium text-red-400/60">Emergency Kill Switch</h3>
                  </div>
                  <p className="text-[12px] text-white/40 mb-4 font-light leading-relaxed">Instantly revoke ALL delegations and disable your Elit from taking any actions. This calls <code className="text-red-300/40">revoke_elit</code> on Solana.</p>
                  {!killSwitchConfirm ? (
                    <button onClick={() => setKillSwitchConfirm(true)}
                      className="px-5 py-2.5 rounded-xl bg-red-500/[0.08] text-red-400/50 border border-red-500/[0.12] text-[12px] font-medium hover:bg-red-500/[0.12] transition-all cursor-pointer">
                      Activate Kill Switch
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={killSwitch} disabled={txPending}
                        className="px-5 py-2.5 rounded-xl bg-red-500/[0.15] text-red-300/60 border border-red-500/[0.2] text-[12px] font-semibold hover:bg-red-500/[0.2] transition-all cursor-pointer disabled:opacity-40">
                        {txPending ? <><Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Revoking...</> : 'Confirm — Revoke Everything'}
                      </button>
                      <button onClick={() => setKillSwitchConfirm(false)}
                        className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-white/40 text-[12px] hover:text-white/50 transition-colors cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  )}
                  {lastTxSig && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-400/[0.03] border border-emerald-400/[0.08]">
                      <a href={explorerUrl(lastTxSig)} target="_blank" rel="noopener noreferrer"
                        className="text-amber-300/50 font-mono text-[11px] hover:text-amber-300/70 flex items-center gap-1.5">
                        ✅ {lastTxSig.slice(0, 20)}... <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <motion.div variants={fadeUp} className="elite-card rounded-2xl p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-7 h-7 text-amber-300/30" />
            </div>
            <h2 className="text-xl font-bold gradient-text-white mb-3">No Elit Yet</h2>
            <p className="text-white/40 mb-8 text-[13px] font-light">Create your AI agent to get started.</p>
            <Link href="/create" className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-all">
              Create Your Elit <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
