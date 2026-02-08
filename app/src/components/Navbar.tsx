'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

const links = [
  { href: '/', label: 'Home' },
  { href: '/create', label: 'Create' },
  { href: '/train', label: 'Train' },
  { href: '/dashboard', label: 'Dashboard' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="font-bold text-lg gradient-text">Elits AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <WalletMultiButton style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '12px',
              fontSize: '14px',
              height: '40px',
            }} />
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4"
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href ? 'text-white bg-white/10' : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
