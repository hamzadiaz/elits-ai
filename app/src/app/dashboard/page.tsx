'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { type PersonalityProfile } from '@/lib/personality'
import { Wallet, Zap, Lightbulb, MessageSquare, ShieldCheck, Mic, Brain, ChevronRight, AlertTriangle, Activity, Clock, TrendingUp } from 'lucide-react'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
  const [profile, setProfile] = useState<PersonalityProfile | null>(null)
  const [hash, setHash] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('elitProfile')
    const storedHash = localStorage.getItem('elitHash')
    if (stored) try { setProfile(JSON.parse(stored)) } catch {}
    if (storedHash) setHash(storedHash)
  }, [])

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
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.06 }}
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl font-bold gradient-text-white mb-1">Dashboard</h1>
          <p className="text-gray-600 text-sm">Manage your Elit, review training, and control delegations.</p>
        </motion.div>

        {profile ? (
          <div className="space-y-5">
            {/* Profile card */}
            <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-dark to-blue flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                  {profile.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
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

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Skills', value: profile.skills.length.toString(), icon: Zap, color: 'text-primary-light', bg: 'from-primary/15 to-primary/5' },
                  { label: 'Interests', value: profile.interests.length.toString(), icon: Lightbulb, color: 'text-blue', bg: 'from-blue/15 to-blue/5' },
                  { label: 'Messages', value: profile.trainingMessages?.length?.toString() || '0', icon: MessageSquare, color: 'text-accent', bg: 'from-accent/15 to-accent/5' },
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

            {/* Personality Hash */}
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

            {/* Activity feed */}
            <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue" />
                <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Brain, text: 'Elit created', time: 'Just now', color: 'text-primary-light' },
                  { icon: MessageSquare, text: `${profile.trainingMessages?.length || 0} training messages exchanged`, time: '5m ago', color: 'text-blue' },
                  { icon: ShieldCheck, text: hash ? 'Personality hash verified' : 'Awaiting verification', time: '10m ago', color: hash ? 'text-green-400' : 'text-yellow-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.02] last:border-0">
                    <item.icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                    <span className="text-sm text-gray-400 flex-1">{item.text}</span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-700">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-white">Skills & Expertise</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light text-xs border border-primary/20 font-medium">{s}</span>
                ))}
                {profile.skills.length === 0 && <span className="text-gray-600 text-sm">Train your Elit to discover skills</span>}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { href: '/train', icon: Mic, title: 'Continue Training', desc: 'Make your Elit smarter', gradient: 'from-primary/10 to-primary/5' },
                { href: '/chat/default', icon: MessageSquare, title: 'Chat with Elit', desc: 'Test your AI clone', gradient: 'from-blue/10 to-blue/5' },
                { href: '/verify/default', icon: ShieldCheck, title: 'Verify Elit', desc: 'View on-chain proof', gradient: 'from-accent/10 to-accent/5' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group gradient-border rounded-2xl p-5 hover:shadow-[0_0_30px_rgba(124,58,237,0.08)] transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} border border-white/[0.06] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-4 h-4 text-white/70" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-0.5 group-hover:text-primary-light transition-colors">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.desc}</p>
                </Link>
              ))}
            </motion.div>

            {/* Danger zone */}
            <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-red-500/[0.02] border border-red-500/10">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400/70" />
                <h3 className="text-sm font-semibold text-red-400/80">Danger Zone</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4">Revoking your Elit will deactivate it permanently on-chain.</p>
              <button className="px-5 py-2 rounded-lg bg-red-500/10 text-red-400/80 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-colors">
                Revoke Elit
              </button>
            </motion.div>
          </div>
        ) : (
          <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-14 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-blue/15 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-primary-light/60" />
            </div>
            <h2 className="text-2xl font-bold gradient-text-white mb-3">No Elit Yet</h2>
            <p className="text-gray-600 mb-8 text-sm">Create your AI clone to get started.</p>
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold btn-glow hover:scale-[1.02] transition-transform"
            >
              Create Your Elit
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
