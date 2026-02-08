'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, ArrowLeft, Home, Sparkles } from 'lucide-react'

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
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-blue/20 animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-white/[0.08] flex items-center justify-center">
            <span className="text-5xl font-bold gradient-text">404</span>
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold gradient-text-white mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          This page doesn&apos;t exist — but your AI clone could. Go create one.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-dark to-blue text-white font-semibold text-sm btn-glow hover:scale-[1.02] transition-transform"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-gray-300 font-medium text-sm hover:bg-white/[0.05] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Create Your Elit
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
