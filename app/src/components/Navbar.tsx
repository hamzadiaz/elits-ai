'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Zap, Menu, X } from 'lucide-react'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(m => m.WalletMultiButton),
  { ssr: false }
)

const links = [
  { href: '/', label: 'Home' },
  { href: '/create', label: 'Create' },
  { href: '/train', label: 'Train' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/turing', label: 'Turing Test' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/60 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary-dark to-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                <Zap className="w-4 h-4 relative z-10" fill="currentColor" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                <span className="text-white">Elits</span>
                <span className="gradient-text ml-0.5">AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-white/[0.08] rounded-lg border border-white/[0.06]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <WalletMultiButton style={{
                background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                height: '36px',
                padding: '0 16px',
                border: 'none',
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
                transition: 'all 0.3s',
              }} />
              <button
                className="md:hidden text-gray-400 hover:text-white transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-l border-white/[0.06] p-6 pt-20">
              <div className="space-y-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        pathname === link.href
                          ? 'text-white bg-white/[0.08] border border-white/[0.06]'
                          : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
