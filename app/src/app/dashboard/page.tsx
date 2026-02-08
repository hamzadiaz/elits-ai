'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { type PersonalityProfile } from '@/lib/personality'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

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
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-gray-400 mb-8">Connect your wallet to manage your Elit.</p>
          <WalletMultiButton style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '16px' }} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400 mb-8">Manage your Elit, review training, and control delegations.</p>

        {profile ? (
          <div className="space-y-6">
            {/* Elit Card */}
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shrink-0">
                  {profile.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">{profile.name}&apos;s Elit</h2>
                  <p className="text-sm text-gray-400 mt-1">{profile.bio}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-green-400">Active</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-500 font-mono">{publicKey?.toBase58().slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Skills', value: profile.skills.length.toString(), icon: '⚡' },
                  { label: 'Interests', value: profile.interests.length.toString(), icon: '💡' },
                  { label: 'Training Messages', value: profile.trainingMessages?.length?.toString() || '0', icon: '💬' },
                  { label: 'Status', value: hash ? 'Verified' : 'Pending', icon: '✅' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality Hash */}
            {hash && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-3">Personality Hash</h3>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="font-mono text-xs text-primary-light break-all">{hash}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">SHA-256 hash of your personality model. This is stored on-chain to verify your Elit&apos;s authenticity.</p>
              </div>
            )}

            {/* Skills */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-primary/20 text-primary-light text-sm border border-primary/30">{s}</span>
                ))}
                {profile.skills.length === 0 && <span className="text-gray-500">Train your Elit to discover skills</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/train" className="glass glass-hover p-6 rounded-2xl text-center group">
                <div className="text-3xl mb-3">🎙️</div>
                <h3 className="font-semibold text-white group-hover:text-primary-light transition-colors">Continue Training</h3>
                <p className="text-xs text-gray-400 mt-1">Make your Elit smarter</p>
              </Link>
              <Link href="/chat/default" className="glass glass-hover p-6 rounded-2xl text-center group">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="font-semibold text-white group-hover:text-primary-light transition-colors">Chat with Elit</h3>
                <p className="text-xs text-gray-400 mt-1">Test your AI clone</p>
              </Link>
              <Link href="/verify/default" className="glass glass-hover p-6 rounded-2xl text-center group">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-semibold text-white group-hover:text-primary-light transition-colors">Verify Elit</h3>
                <p className="text-xs text-gray-400 mt-1">View on-chain proof</p>
              </Link>
            </div>

            {/* Danger Zone */}
            <div className="glass p-6 rounded-2xl border border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h3>
              <p className="text-sm text-gray-400 mb-4">Revoking your Elit will deactivate it permanently on-chain.</p>
              <button className="px-6 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm hover:bg-red-500/20 transition-colors">
                🚫 Revoke Elit
              </button>
            </div>
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Elit Yet</h2>
            <p className="text-gray-400 mb-8">Create your AI clone to get started.</p>
            <Link href="/create" className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold glow hover:scale-105 transition-transform">
              Create Your Elit →
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
