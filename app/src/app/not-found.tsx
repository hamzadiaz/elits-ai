'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
          className="relative w-28 h-28 mx-auto mb-8"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/[0.08] to-amber-600/[0.08] animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <span className="text-5xl font-bold gradient-text">404</span>
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold gradient-text-white mb-3">Page Not Found</h1>
        <p className="text-white/40 mb-8 text-[13px] font-light leading-relaxed">
          This page doesn&apos;t exist — but your AI agent could. Go create one.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.02] transition-transform"
          >
            <Home className="w-4 h-4 opacity-60" />
            Go Home
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/50 font-medium text-[13px] hover:bg-white/[0.06] hover:text-white/70 transition-all"
          >
            <Sparkles className="w-4 h-4 opacity-60" />
            Create Your Elit
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
