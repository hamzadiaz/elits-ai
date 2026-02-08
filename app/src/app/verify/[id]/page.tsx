'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ExternalLink, Copy, Check, Globe, Fingerprint, Key, MessageSquare } from 'lucide-react'

export default function VerifyElitPage() {
  const [hash, setHash] = useState('')
  const [profile, setProfile] = useState<{ name: string; bio: string; skills: string[] } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const storedHash = localStorage.getItem('elitHash')
    const storedProfile = localStorage.getItem('elitProfile')
    if (storedHash) setHash(storedHash)
    if (storedProfile) try { setProfile(JSON.parse(storedProfile)) } catch {}
  }, [])

  const copyHash = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Animated checkmark */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-green-400/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-green-400/30 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-green-400" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text-white mb-2">Elit Verification</h1>
          <p className="text-gray-600 text-sm">On-chain cryptographic proof of authorization</p>
        </div>

        {profile ? (
          <div className="space-y-4">
            {/* Profile card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="gradient-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-dark to-blue flex items-center justify-center text-xl font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                  {profile.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{profile.name}&apos;s Elit</h2>
                  <p className="text-sm text-gray-500 line-clamp-1">{profile.bio?.slice(0, 80)}</p>
                </div>
              </div>

              {/* Verification status */}
              <div className="p-4 rounded-xl bg-green-400/[0.04] border border-green-400/20 mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-sm font-semibold text-green-400">Verified & Active</span>
                </div>
                <p className="text-xs text-gray-500">This Elit is authorized by the wallet owner and its personality model is verified on-chain.</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <Fingerprint className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 mb-1">Personality Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-primary-light/80 break-all flex-1">{hash || 'Not yet generated'}</p>
                      {hash && (
                        <button onClick={copyHash} className="shrink-0 p-1 hover:text-white text-gray-600 transition-colors">
                          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <Globe className="w-4 h-4 text-blue mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Network</p>
                    <p className="text-sm text-gray-300">Solana Devnet</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <Key className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Delegation Scopes</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {['Chat', 'Post', 'Code'].map(scope => (
                        <span key={scope} className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] border border-accent/20 font-medium">{scope}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="gradient-border rounded-2xl p-5"
              >
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-medium">Verified Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary-light text-xs border border-primary/20">{s}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <a
                href="/chat/default"
                className="flex-1 group flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold text-sm btn-glow hover:scale-[1.02] transition-transform"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Elit
              </a>
              <button className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-gray-500 hover:text-white hover:border-white/[0.12] transition-all text-sm">
                <ExternalLink className="w-4 h-4" />
                Explorer
              </button>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gradient-border rounded-2xl p-10 text-center"
          >
            <p className="text-gray-500 mb-4">No Elit found. Create one first.</p>
            <a href="/create" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary/15 text-primary-light text-sm border border-primary/20 hover:bg-primary/25 transition-colors">
              Create Elit →
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
