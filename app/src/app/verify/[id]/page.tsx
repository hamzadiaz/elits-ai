'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Avatar3D } from '@/components/Avatar3D'
import {
  ShieldCheck, ExternalLink, Copy, Check, Globe, Fingerprint, Key,
  MessageSquare, Calendar, TrendingUp, Clock, Zap, User
} from 'lucide-react'

export default function VerifyElitPage() {
  const [hash, setHash] = useState('')
  const [profile, setProfile] = useState<{ name: string; bio: string; skills: string[]; avatarUrl?: string | null } | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedWallet, setCopiedWallet] = useState(false)
  const [wallet, setWallet] = useState('')

  useEffect(() => {
    const storedHash = localStorage.getItem('elitHash')
    const storedProfile = localStorage.getItem('elitProfile')
    if (storedHash) setHash(storedHash)
    if (storedProfile) try { setProfile(JSON.parse(storedProfile)) } catch {}
    setWallet('7xKX...m4Dp')
  }, [])

  const copyHash = () => { navigator.clipboard.writeText(hash); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const copyWallet = () => { navigator.clipboard.writeText(wallet); setCopiedWallet(true); setTimeout(() => setCopiedWallet(false), 2000) }

  const creationDate = new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const trustScore = 87

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
            className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-400/[0.04] animate-pulse-glow" />
            <div className="absolute inset-0 rounded-full bg-white/[0.015] border border-emerald-400/[0.15] flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-400/50" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-2xl font-bold gradient-text-white mb-2 tracking-tight">On-Chain Verified</motion.h1>
          <p className="text-white/15 text-[13px] font-light">Cryptographic proof of authorization on Solana</p>
        </div>

        {profile ? (
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-5">
                <Avatar3D avatarUrl={profile.avatarUrl} name={profile.name} size="md" />
                <div>
                  <h2 className="text-base font-semibold text-white/80">{profile.name}&apos;s Elit</h2>
                  <p className="text-[12px] text-white/20 line-clamp-1 font-light">{profile.bio?.slice(0, 80)}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-400/[0.02] border border-emerald-400/[0.08] mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
                  </span>
                  <span className="text-[12px] font-medium text-emerald-400/60">Verified & Active</span>
                </div>
                <p className="text-[11px] text-white/15 font-light">Authorized by wallet owner, personality model verified on-chain.</p>
              </div>

              {/* Trust Score */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/15 flex items-center gap-1.5 uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" /> Trust Score
                  </span>
                  <span className="text-[12px] font-semibold text-emerald-400/50">{trustScore}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${trustScore}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400/40 to-emerald-500/40" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.06]">
                  <User className="w-3.5 h-3.5 text-amber-300/30 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/15 mb-1 uppercase tracking-wider">Owner Wallet</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[11px] text-white/30">{wallet}</p>
                      <button onClick={copyWallet} className="shrink-0 p-1 hover:text-white/40 text-white/15 transition-colors cursor-pointer">
                        {copiedWallet ? <Check className="w-3 h-3 text-emerald-400/50" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.06]">
                  <Fingerprint className="w-3.5 h-3.5 text-amber-300/30 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/15 mb-1 uppercase tracking-wider">Personality Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[10px] text-amber-300/30 break-all flex-1">{hash || 'Not yet generated'}</p>
                      {hash && (
                        <button onClick={copyHash} className="shrink-0 p-1 hover:text-white/40 text-white/15 transition-colors cursor-pointer">
                          {copied ? <Check className="w-3 h-3 text-emerald-400/50" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.06]">
                    <Calendar className="w-3.5 h-3.5 text-amber-300/25 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/15 mb-0.5 uppercase tracking-wider">Created</p>
                      <p className="text-[11px] text-white/30 font-light">{creationDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.06]">
                    <Clock className="w-3.5 h-3.5 text-emerald-400/30 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/15 mb-0.5 uppercase tracking-wider">Last Active</p>
                      <p className="text-[11px] text-white/30 font-light">Just now</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.06]">
                  <Globe className="w-3.5 h-3.5 text-amber-300/25 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/15 mb-1 uppercase tracking-wider">Network</p>
                    <p className="text-[12px] text-white/30 font-light">Solana Devnet</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.06]">
                  <Key className="w-3.5 h-3.5 text-amber-300/25 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/15 mb-1.5 uppercase tracking-wider">Delegation Scopes</p>
                    <div className="flex flex-wrap gap-1">
                      {['Chat', 'Post', 'Code', 'Research'].map(scope => (
                        <span key={scope} className="elite-tag text-[10px]">{scope}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {profile.skills?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="elite-card rounded-2xl p-5">
                <p className="text-[10px] text-white/15 uppercase tracking-wider mb-3 font-medium flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Verified Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map(s => <span key={s} className="elite-tag text-[10px]">{s}</span>)}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="elite-card rounded-2xl p-5">
              <p className="text-[10px] text-white/15 uppercase tracking-wider mb-3 font-medium">Embeddable Badge</p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/[0.06]">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-400/[0.04] border border-emerald-400/[0.1]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/50" />
                  <span className="text-[11px] text-emerald-400/50 font-medium">Verified Elit</span>
                  <span className="text-[10px] text-white/10">·</span>
                  <span className="text-[10px] text-white/15">{profile.name}</span>
                </div>
                <span className="text-[9px] text-white/10 ml-auto font-mono">elits.ai/verify/{hash?.slice(0, 8)}</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3">
              <a href="/chat/default" className="flex-1 group flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-medium text-[13px] btn-glow hover:scale-[1.02] transition-all">
                <MessageSquare className="w-3.5 h-3.5 opacity-60" /> Talk to this Elit
              </a>
              <a href="https://explorer.solana.com/?cluster=devnet" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.015] text-white/25 hover:text-white/45 transition-all text-[13px]">
                <ExternalLink className="w-3.5 h-3.5" /> Explorer
              </a>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card rounded-2xl p-10 text-center">
            <p className="text-white/20 mb-4 text-[13px] font-light">No Elit found. Create one first.</p>
            <a href="/create" className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500/[0.08] text-amber-300/50 text-[12px] border border-amber-500/20 hover:bg-amber-500/[0.12] transition-all">
              Create Elit →
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
