'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function VerifyElitPage() {
  const [hash, setHash] = useState('')
  const [profile, setProfile] = useState<{ name: string; bio: string; skills: string[] } | null>(null)

  useEffect(() => {
    const storedHash = localStorage.getItem('elitHash')
    const storedProfile = localStorage.getItem('elitProfile')
    if (storedHash) setHash(storedHash)
    if (storedProfile) {
      try { setProfile(JSON.parse(storedProfile)) } catch {}
    }
  }, [])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-400/30 mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Elit Verification</h1>
          <p className="text-gray-400">On-chain proof of authorization</p>
        </div>

        {profile ? (
          <div className="glass p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
                {profile.name?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile.name}&apos;s Elit</h2>
                <p className="text-sm text-gray-400">{profile.bio?.slice(0, 100)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-400/5 border border-green-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-medium text-green-400">Verified</span>
                </div>
                <p className="text-xs text-gray-400">This Elit is authorized by the wallet owner.</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Personality Hash</p>
                <p className="font-mono text-xs text-primary-light break-all bg-white/5 p-3 rounded-lg">{hash || 'Not yet generated'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Network</p>
                <p className="text-sm text-gray-300">Solana Devnet</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Skills</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {profile.skills?.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={`/chat/default`}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-center text-sm hover:scale-105 transition-transform"
              >
                💬 Chat with this Elit
              </a>
            </div>
          </div>
        ) : (
          <div className="glass p-8 rounded-2xl text-center">
            <p className="text-gray-400">No Elit found. Create one first.</p>
            <a href="/create" className="inline-block mt-4 px-6 py-2 rounded-xl bg-primary/20 text-primary-light text-sm">
              Create Elit →
            </a>
          </div>
        )}
      </motion.div>
    </div>
  )
}
