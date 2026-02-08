'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { type PersonalityProfile } from '@/lib/personality'
import { Avatar3D } from '@/components/Avatar3D'
import {
  Wallet, Zap, Lightbulb, MessageSquare, ShieldCheck, Mic, Brain, ChevronRight,
  AlertTriangle, Activity, Clock, TrendingUp, Phone, Twitter, Code, Mail, Search,
  Play, CheckCircle, XCircle, Shield, Trash2, Plus, Eye, Settings, Power
} from 'lucide-react'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } }

type ActionType = 'post_tweet' | 'write_code' | 'respond_message' | 'research'

interface Action {
  id: string
  type: ActionType
  prompt: string
  result: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
}

interface Delegation {
  id: string
  scopes: string[]
  expiresAt: string
  restrictions: string
  active: boolean
  createdAt: string
}

const ACTION_ICONS: Record<ActionType, typeof Twitter> = {
  post_tweet: Twitter,
  write_code: Code,
  respond_message: Mail,
  research: Search,
}

const ACTION_LABELS: Record<ActionType, string> = {
  post_tweet: 'Post Tweet',
  write_code: 'Write Code',
  respond_message: 'Respond to Message',
  research: 'Research Topic',
}

const ACTION_COLORS: Record<ActionType, string> = {
  post_tweet: 'text-blue-400',
  write_code: 'text-green-400',
  respond_message: 'text-purple-400',
  research: 'text-cyan-400',
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
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

  useEffect(() => {
    const stored = localStorage.getItem('elitProfile')
    const storedHash = localStorage.getItem('elitHash')
    const storedActions = localStorage.getItem('elitActions')
    if (stored) try { setProfile(JSON.parse(stored)) } catch {}
    if (storedHash) setHash(storedHash)
    if (storedActions) try { setActions(JSON.parse(storedActions)) } catch {}
  }, [])

  const executeAction = async () => {
    if (!actionPrompt.trim() || !profile) return
    setIsExecuting(true)
    const systemPrompt = localStorage.getItem('elitSystemPrompt') || ''
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: actionType,
          prompt: actionPrompt,
          systemPrompt,
          delegationScopes: ['chat', 'post', 'code', 'research', 'full'],
        }),
      })
      const data = await res.json()
      const newAction: Action = { ...data, prompt: actionPrompt }
      const updated = [newAction, ...actions]
      setActions(updated)
      localStorage.setItem('elitActions', JSON.stringify(updated))
      setActionPrompt('')
    } catch (err) {
      console.error(err)
    }
    setIsExecuting(false)
  }

  const revokeDelegation = (id: string) => {
    setDelegations(prev => prev.map(d => d.id === id ? { ...d, active: false } : d))
  }

  const createDelegation = () => {
    if (newScopes.length === 0) return
    const del: Delegation = {
      id: `del-${Date.now()}`,
      scopes: newScopes,
      expiresAt: new Date(Date.now() + parseInt(newExpiry) * 86400000).toISOString(),
      restrictions: newRestrictions,
      active: true,
      createdAt: new Date().toISOString(),
    }
    setDelegations(prev => [del, ...prev])
    setShowNewDelegation(false)
    setNewScopes([])
    setNewRestrictions('')
  }

  const killSwitch = () => {
    setDelegations(prev => prev.map(d => ({ ...d, active: false })))
    setKillSwitchConfirm(false)
  }

  if (!connected) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue/20 border border-white/[0.08] flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-white mb-3">Dashboard</h1>
          <p className="text-gray-500 mb-8 text-sm">Connect your wallet to manage your Elit.</p>
          <WalletMultiButton style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)', borderRadius: '14px', fontSize: '15px', fontWeight: '600', height: '48px' }} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial="initial" animate="animate" transition={{ staggerChildren: 0.06 }}>
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-2xl font-bold gradient-text-white mb-1">Dashboard</h1>
          <p className="text-gray-600 text-sm">Manage your Elit, execute actions, and control delegations.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-6 w-fit">
          {(['overview', 'actions', 'delegations'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                tab === t ? 'bg-primary/15 text-primary-light border border-primary/20' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </motion.div>

        {profile ? (
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Profile card */}
                <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar3D avatarUrl={profile.avatarUrl} name={profile.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-white">{profile.name}&apos;s Elit</h2>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{profile.bio}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                        </span>
                        <span className="text-xs text-green-400 font-medium">Active</span>
                        <span className="text-xs text-gray-700">·</span>
                        <span className="text-xs text-gray-600 font-mono">{publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Skills', value: profile.skills.length.toString(), icon: Zap, color: 'text-primary-light', bg: 'from-primary/15 to-primary/5' },
                      { label: 'Actions', value: actions.length.toString(), icon: Activity, color: 'text-blue', bg: 'from-blue/15 to-blue/5' },
                      { label: 'Delegations', value: delegations.filter(d => d.active).length.toString(), icon: Shield, color: 'text-accent', bg: 'from-accent/15 to-accent/5' },
                      { label: 'Status', value: hash ? 'Verified' : 'Pending', icon: ShieldCheck, color: hash ? 'text-green-400' : 'text-yellow-400', bg: hash ? 'from-green-400/15 to-green-400/5' : 'from-yellow-400/15 to-yellow-400/5' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 hover:border-white/[0.08] transition-colors">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3`}>
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className="text-xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {hash && (
                  <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-primary-light" />
                      <h3 className="text-sm font-semibold text-white">Personality Hash</h3>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
                      <p className="font-mono text-xs text-primary-light/70 break-all">{hash}</p>
                    </div>
                    <p className="text-[10px] text-gray-700 mt-2">SHA-256 hash of your personality model, stored on Solana for verification.</p>
                  </motion.div>
                )}

                {/* Quick actions */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { href: '/train', icon: Mic, title: 'Train', desc: 'Chat or voice', gradient: 'from-primary/10 to-primary/5' },
                    { href: '/chat/default', icon: MessageSquare, title: 'Chat', desc: 'Test your clone', gradient: 'from-blue/10 to-blue/5' },
                    { href: '/verify/default', icon: ShieldCheck, title: 'Verify', desc: 'On-chain proof', gradient: 'from-accent/10 to-accent/5' },
                    { href: '/turing', icon: Eye, title: 'Turing Test', desc: 'Real vs AI', gradient: 'from-green-400/10 to-green-400/5' },
                  ].map(action => (
                    <Link key={action.href} href={action.href} className="group gradient-border rounded-2xl p-5 hover:shadow-[0_0_30px_rgba(124,58,237,0.08)] transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} border border-white/[0.06] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-4 h-4 text-white/70" />
                      </div>
                      <h3 className="font-semibold text-white text-sm mb-0.5 group-hover:text-primary-light transition-colors">{action.title}</h3>
                      <p className="text-xs text-gray-600">{action.desc}</p>
                    </Link>
                  ))}
                </motion.div>

                {/* Recent actions preview */}
                {actions.length > 0 && (
                  <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue" />
                        <h3 className="text-sm font-semibold text-white">Recent Actions</h3>
                      </div>
                      <button onClick={() => setTab('actions')} className="text-xs text-primary-light hover:text-primary transition-colors">View all →</button>
                    </div>
                    <div className="space-y-2">
                      {actions.slice(0, 3).map(action => {
                        const Icon = ACTION_ICONS[action.type]
                        return (
                          <div key={action.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <Icon className={`w-4 h-4 ${ACTION_COLORS[action.type]} shrink-0`} />
                            <span className="text-sm text-gray-300 flex-1 truncate">{action.prompt}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              action.status === 'completed' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
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
              <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Execute action */}
                <div className="gradient-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary-light" />
                    Execute Action
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {(Object.keys(ACTION_LABELS) as ActionType[]).map(type => {
                      const Icon = ACTION_ICONS[type]
                      return (
                        <button
                          key={type}
                          onClick={() => setActionType(type)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                            actionType === type
                              ? 'border-primary/30 bg-primary/10 text-primary-light'
                              : 'border-white/[0.04] bg-white/[0.02] text-gray-500 hover:border-white/[0.08]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {ACTION_LABELS[type].split(' ').slice(0, 2).join(' ')}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={actionPrompt}
                      onChange={e => setActionPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && executeAction()}
                      placeholder={
                        actionType === 'post_tweet' ? "What should the tweet be about?" :
                        actionType === 'write_code' ? "What code should be written?" :
                        actionType === 'respond_message' ? "What message to respond to?" :
                        "What topic to research?"
                      }
                      className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/30"
                    />
                    <button
                      onClick={executeAction}
                      disabled={isExecuting || !actionPrompt.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-40"
                    >
                      {isExecuting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action history */}
                <div className="gradient-border rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue" />
                    Action History
                  </h3>
                  {actions.length === 0 ? (
                    <p className="text-center text-gray-600 text-sm py-8">No actions yet. Execute one above!</p>
                  ) : (
                    <div className="space-y-3">
                      {actions.map(action => {
                        const Icon = ACTION_ICONS[action.type]
                        return (
                          <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${ACTION_COLORS[action.type]}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium text-white">{ACTION_LABELS[action.type]}</span>
                                <p className="text-xs text-gray-600 truncate">{action.prompt}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {action.status === 'completed' ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                ) : action.status === 'failed' ? (
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                ) : (
                                  <div className="w-3.5 h-3.5 border-2 border-yellow-400/50 border-t-yellow-400 rounded-full animate-spin" />
                                )}
                                <span className="text-[10px] text-gray-600">
                                  {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            {action.result && (
                              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                                <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">{action.result}</p>
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
              <motion.div key="delegations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* New delegation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewDelegation(!showNewDelegation)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary-light border border-primary/20 text-xs font-medium hover:bg-primary/15 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Delegation
                  </button>
                </div>

                <AnimatePresence>
                  {showNewDelegation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="gradient-border rounded-2xl p-5 overflow-hidden"
                    >
                      <h3 className="text-sm font-semibold text-white mb-4">Create Delegation</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-600 mb-2 block">Scopes</label>
                          <div className="flex flex-wrap gap-2">
                            {['chat', 'post', 'code', 'research', 'full'].map(scope => (
                              <button
                                key={scope}
                                onClick={() => setNewScopes(prev =>
                                  prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
                                )}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                                  newScopes.includes(scope)
                                    ? 'border-primary/30 bg-primary/15 text-primary-light'
                                    : 'border-white/[0.06] bg-white/[0.02] text-gray-500 hover:border-white/[0.1]'
                                }`}
                              >
                                {scope}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-2 block">Expires in</label>
                          <select
                            value={newExpiry}
                            onChange={e => setNewExpiry(e.target.value)}
                            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/30 w-full"
                          >
                            <option value="1">1 day</option>
                            <option value="7">7 days</option>
                            <option value="30">30 days</option>
                            <option value="90">90 days</option>
                            <option value="365">1 year</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-2 block">Restrictions (optional)</label>
                          <input
                            value={newRestrictions}
                            onChange={e => setNewRestrictions(e.target.value)}
                            placeholder="e.g. No controversial topics"
                            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/30"
                          />
                        </div>
                        <button
                          onClick={createDelegation}
                          disabled={newScopes.length === 0}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold text-sm hover:scale-[1.02] transition-transform disabled:opacity-40"
                        >
                          Create Delegation
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active delegations */}
                <div className="gradient-border rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    Active Delegations
                  </h3>
                  <div className="space-y-3">
                    {delegations.map(del => (
                      <motion.div
                        key={del.id}
                        layout
                        className={`rounded-xl border p-4 transition-all ${
                          del.active
                            ? 'bg-white/[0.02] border-white/[0.06]'
                            : 'bg-red-500/[0.02] border-red-500/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {del.scopes.map(scope => (
                              <span key={scope} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] border border-accent/20 font-medium capitalize">
                                {scope}
                              </span>
                            ))}
                          </div>
                          {del.active ? (
                            <button
                              onClick={() => revokeDelegation(del.id)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-medium hover:bg-red-500/20 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              Revoke
                            </button>
                          ) : (
                            <span className="text-[10px] text-red-400/60">Revoked</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-gray-600">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Expires {new Date(del.expiresAt).toLocaleDateString()}</span>
                          {del.restrictions && <span>· {del.restrictions}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Kill Switch */}
                <div className="rounded-2xl p-6 bg-red-500/[0.03] border border-red-500/15">
                  <div className="flex items-center gap-2 mb-3">
                    <Power className="w-5 h-5 text-red-400" />
                    <h3 className="text-base font-semibold text-red-400">Emergency Kill Switch</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Instantly revoke ALL delegations and disable your Elit from taking any actions. This calls the Solana program to revoke on-chain.</p>
                  {!killSwitchConfirm ? (
                    <button
                      onClick={() => setKillSwitchConfirm(true)}
                      className="px-6 py-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 text-sm font-semibold hover:bg-red-500/25 transition-colors"
                    >
                      🛑 Activate Kill Switch
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={killSwitch}
                        className="px-6 py-3 rounded-xl bg-red-500/30 text-red-300 border border-red-500/40 text-sm font-bold hover:bg-red-500/40 transition-colors animate-pulse"
                      >
                        ⚠️ CONFIRM — REVOKE EVERYTHING
                      </button>
                      <button
                        onClick={() => setKillSwitchConfirm(false)}
                        className="px-4 py-3 rounded-xl border border-white/[0.06] text-gray-500 text-sm hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-14 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-blue/15 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-primary-light/60" />
            </div>
            <h2 className="text-2xl font-bold gradient-text-white mb-3">No Elit Yet</h2>
            <p className="text-gray-600 mb-8 text-sm">Create your AI clone to get started.</p>
            <Link href="/create" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold btn-glow hover:scale-[1.02] transition-transform">
              Create Your Elit
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
