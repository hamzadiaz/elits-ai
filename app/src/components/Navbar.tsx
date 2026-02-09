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
  { href: '/explore', label: 'Explore' },
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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-black/40 backdrop-blur-3xl border-b border-white/[0.06] shadow-[0_4px_60px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center overflow-hidden">
                <Zap className="w-3.5 h-3.5 text-white/90 relative z-10" fill="currentColor" />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-500-light opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span className="font-semibold text-base tracking-tight">
                <span className="text-white/90">Elits</span>
                <span className="gradient-text ml-0.5 font-bold">AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 ${
                    pathname === link.href
                      ? 'text-white/90'
                      : 'text-white/55 hover:text-white/60'
                  }`}
                >
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-white/[0.04] rounded-lg border border-white/[0.08]"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <WalletMultiButton style={{
                background: 'rgba(212, 160, 23, 0.15)',
                border: '0.5px solid rgba(212, 160, 23, 0.25)',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '500',
                height: '34px',
                padding: '0 14px',
                boxShadow: '0 0 30px rgba(212, 160, 23, 0.06)',
                transition: 'all 0.4s',
                color: '#f0c940',
                letterSpacing: '0.01em',
              }} />
              <button
                className="md:hidden text-white/55 hover:text-white/60 transition-colors"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[#060608] border-l border-white/[0.06] p-6 pt-20"
            >
              <div className="space-y-1">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        pathname === link.href
                          ? 'text-white/90 bg-white/[0.04] border border-white/[0.08]'
                          : 'text-white/55 hover:text-white/60 hover:bg-white/[0.02]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
