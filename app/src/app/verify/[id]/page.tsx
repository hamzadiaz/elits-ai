'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Avatar3D } from '@/components/Avatar3D'
import { getConnection, getProvider, getProgram, fetchElitAccount, findElitPDA, explorerAccountUrl, PublicKey } from '@/lib/solana'
import {
  ShieldCheck, ExternalLink, Copy, Check, Globe, Fingerprint, Key,
  MessageSquare, Calendar, TrendingUp, Clock, Zap, User, Loader2, AlertTriangle, Brain
} from 'lucide-react'
import { XPBar } from '@/components/XPBar'
import { LevelBadge } from '@/components/LevelBadge'
import { CapabilityChart } from '@/components/CapabilityChart'
import { calculateXP, calculateCapabilities } from '@/lib/xp'

interface ElitData {
  name: string
  bio: string
  personalityHash: string
  avatarUri: string
  createdAt: number
  status: 'active' | 'revoked'
  owner: string
}

export default function VerifyElitPage() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const [elitData, setElitData] = useState<ElitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedWallet, setCopiedWallet] = useState(false)
  const [localProfile, setLocalProfile] = useState<{ name: string; bio: string; skills: string[]; avatarUrl?: string | null; trainingMessages?: unknown[]; trainingSessions?: unknown[]; knowledgeGraph?: unknown[]; values?: string[] } | null>(null)

  const loadFromChain = useCallback(async () => {
    if (!publicKey) { setLoading(false); return }
    setLoading(true)
    try {
      const connection = getConnection()
      // Create a read-only provider
      const provider = getProvider(connection, { publicKey, signTransaction: signTransaction || (async (tx: unknown) => tx), signAllTransactions: signAllTransactions || (async (txs: unknown) => txs) } as never)
      const program = getProgram(provider)
      const account = await fetchElitAccount(program, publicKey)
      if (account) {
        setElitData({
          name: account.name,
          bio: account.bio,
          personalityHash: account.personalityHash,
          avatarUri: account.avatarUri,
          createdAt: account.createdAt.toNumber() * 1000,
          status: (account.status as Record<string, unknown>).active !== undefined ? 'active' : 'revoked',
          owner: account.owner.toBase58(),
        })
      } else {
        setError('No Elit found on-chain for this wallet')
      }
    } catch (err) {
      console.error('Failed to fetch from chain:', err)
      setError('Failed to read from Solana. Showing local data.')
    }
    setLoading(false)
  }, [publicKey, signTransaction, signAllTransactions])

  useEffect(() => {
    // Load local profile as fallback
    const storedProfile = localStorage.getItem('elitProfile')
    if (storedProfile) try { setLocalProfile(JSON.parse(storedProfile)) } catch {}

    loadFromChain()
  }, [loadFromChain])

  const profile = elitData ? {
    name: elitData.name,
    bio: elitData.bio,
    skills: localProfile?.skills || [],
    avatarUrl: elitData.avatarUri || localProfile?.avatarUrl,
  } : localProfile

  const hash = elitData?.personalityHash || localStorage.getItem('elitHash') || ''
  const wallet = elitData?.owner || publicKey?.toBase58() || ''
  const walletShort = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-6)}` : ''
  const isOnChain = !!elitData
  const isActive = elitData ? elitData.status === 'active' : true
  const creationDate = elitData
    ? new Date(elitData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown'
  const [elitPDA] = publicKey ? findElitPDA(publicKey) : [null]

  const copyHash = () => { navigator.clipboard.writeText(hash); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const copyWallet = () => { navigator.clipboard.writeText(wallet); setCopiedWallet(true); setTimeout(() => setCopiedWallet(false), 2000) }

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-8 h-8 text-amber-300/40 animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-[13px]">Reading from Solana...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
            className="relative w-20 h-20 mx-auto mb-6">
            <div className={`absolute inset-0 rounded-full ${isActive ? 'bg-emerald-400/[0.04]' : 'bg-red-400/[0.04]'} animate-pulse-glow`} />
            <div className={`absolute inset-0 rounded-full bg-white/[0.04] border ${isActive ? 'border-emerald-400/[0.15]' : 'border-red-400/[0.15]'} flex items-center justify-center backdrop-blur-sm`}>
              {isActive ? <ShieldCheck className="w-8 h-8 text-emerald-400/50" /> : <AlertTriangle className="w-8 h-8 text-red-400/50" />}
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-2xl font-bold gradient-text-white mb-2 tracking-tight">
            {isOnChain ? 'On-Chain Verified' : 'Local Only'}
          </motion.h1>
          <p className="text-white/40 text-[13px] font-light">
            {isOnChain ? 'Cryptographic proof of authorization on Solana' : 'Not yet registered on-chain'}
          </p>
          {isOnChain && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/[0.06] border border-emerald-400/[0.1]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
              </span>
              <span className="text-[11px] text-emerald-400/60">Live on Devnet</span>
            </div>
          )}
        </div>

        {profile ? (
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <Avatar3D avatarUrl={profile.avatarUrl} name={profile.name} size="md" />
                  {localProfile && (
                    <div className="absolute -bottom-1 -right-1">
                      <LevelBadge xp={calculateXP(localProfile as Parameters<typeof calculateXP>[0])} size="sm" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white/80">{profile.name}&apos;s Elit</h2>
                    {localProfile && <LevelBadge xp={calculateXP(localProfile as Parameters<typeof calculateXP>[0])} size="sm" showTier />}
                  </div>
                  <p className="text-[12px] text-white/40 line-clamp-1 font-light">{profile.bio?.slice(0, 80)}</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isActive ? 'bg-emerald-400/[0.02] border border-emerald-400/[0.08]' : 'bg-red-400/[0.02] border border-red-400/[0.08]'} mb-5`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isActive ? 'bg-emerald-400/60' : 'bg-red-400/60'} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isActive ? 'bg-emerald-400/80' : 'bg-red-400/80'}`} />
                  </span>
                  <span className={`text-[12px] font-medium ${isActive ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                    {isActive ? 'Verified & Active' : 'Revoked'}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 font-light">
                  {isOnChain ? 'Authorized by wallet owner, personality model verified on-chain.' : 'Created locally. Connect wallet and create on-chain for verification.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <User className="w-3.5 h-3.5 text-amber-300/30 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Owner Wallet</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[11px] text-white/50">{walletShort}</p>
                      <button onClick={copyWallet} className="shrink-0 p-1 hover:text-white/40 text-white/40 transition-colors cursor-pointer">
                        {copiedWallet ? <Check className="w-3 h-3 text-emerald-400/50" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <Fingerprint className="w-3.5 h-3.5 text-amber-300/30 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Personality Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[10px] text-amber-300/40 break-all flex-1">{hash || 'Not yet generated'}</p>
                      {hash && (
                        <button onClick={copyHash} className="shrink-0 p-1 hover:text-white/40 text-white/40 transition-colors cursor-pointer">
                          {copied ? <Check className="w-3 h-3 text-emerald-400/50" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <Calendar className="w-3.5 h-3.5 text-amber-300/25 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40 mb-0.5 uppercase tracking-wider">Created</p>
                      <p className="text-[11px] text-white/50 font-light">{creationDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <Clock className="w-3.5 h-3.5 text-emerald-400/30 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40 mb-0.5 uppercase tracking-wider">Source</p>
                      <p className="text-[11px] text-white/50 font-light">{isOnChain ? 'On-Chain' : 'Local'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <Globe className="w-3.5 h-3.5 text-amber-300/25 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Network</p>
                    <p className="text-[12px] text-white/50 font-light">Solana Devnet</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* XP & Level */}
            {localProfile && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="elite-card rounded-2xl p-5">
                <XPBar xp={calculateXP(localProfile as Parameters<typeof calculateXP>[0])} />
              </motion.div>
            )}

            {/* Capabilities */}
            {localProfile && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="elite-card rounded-2xl p-5">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3 font-medium flex items-center gap-1.5">
                  <Brain className="w-3 h-3" /> Agent Capabilities
                </p>
                <CapabilityChart
                  capabilities={calculateCapabilities(localProfile as Parameters<typeof calculateCapabilities>[0])}
                  size={160}
                />
              </motion.div>
            )}

            {profile.skills?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="elite-card rounded-2xl p-5">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3 font-medium flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Verified Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map(s => <span key={s} className="elite-tag text-[10px]">{s}</span>)}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="elite-card rounded-2xl p-5">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3 font-medium">Embeddable Badge</p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isOnChain ? 'bg-emerald-400/[0.04] border border-emerald-400/[0.1]' : 'bg-amber-400/[0.04] border border-amber-400/[0.1]'}`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isOnChain ? 'text-emerald-400/50' : 'text-amber-400/50'}`} />
                  <span className={`text-[11px] font-medium ${isOnChain ? 'text-emerald-400/50' : 'text-amber-400/50'}`}>
                    {isOnChain ? 'Verified Elit' : 'Unverified'}
                  </span>
                  <span className="text-[10px] text-white/10">·</span>
                  <span className="text-[10px] text-white/40">{profile.name}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3">
              <a href="/chat/default" className="flex-1 group flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-all">
                <MessageSquare className="w-3.5 h-3.5 opacity-60" /> Talk to this Elit
              </a>
              {elitPDA && (
                <a href={explorerAccountUrl(elitPDA.toBase58())} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white/60 transition-all text-[13px]">
                  <ExternalLink className="w-3.5 h-3.5" /> Explorer
                </a>
              )}
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card rounded-2xl p-10 text-center">
            {error && <p className="text-amber-300/40 mb-4 text-[12px]">{error}</p>}
            <p className="text-white/40 mb-4 text-[13px] font-light">No Elit found. Create one first.</p>
            <a href="/create" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500/[0.08] text-amber-300/50 text-[12px] border border-amber-500/20 hover:bg-amber-500/[0.12] transition-all">
              Create Elit →
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
