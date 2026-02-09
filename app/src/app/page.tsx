'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { Mic, Brain, Zap, Shield, Sparkles, ArrowRight, ChevronRight, Fingerprint, Globe, Lock, Eye } from 'lucide-react'

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => `${Math.round(v).toLocaleString()}${suffix}`)
  const [display, setDisplay] = useState(`0${suffix}`)
  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, { duration: 2.5, ease: 'easeOut' })
      const unsub = rounded.on('change', v => setDisplay(v))
      return () => { controls.stop(); unsub() }
    }
  }, [isInView, target, count, rounded])
  return <span ref={ref}>{display}</span>
}

function TypingText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const current = texts[index]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (text.length < current.length) setText(current.slice(0, text.length + 1))
        else setTimeout(() => setDeleting(true), 2500)
      } else {
        if (text.length > 0) setText(text.slice(0, -1))
        else { setDeleting(false); setIndex((index + 1) % texts.length) }
      }
    }, deleting ? 25 : 55)
    return () => clearTimeout(timeout)
  }, [text, deleting, index, texts])
  return (
    <span className="text-white/50">
      {text}
      <span className="cursor-blink text-amber-400/60">|</span>
    </span>
  )
}

function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-amber-600/8 rounded-full blur-[200px] animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[200px] animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-700/3 rounded-full blur-[250px]" />
      {[...Array(5)].map((_, i) => (
        <motion.div key={i} className="absolute w-[2px] h-[2px] bg-amber-400/20 rounded-full"
          style={{ top: `${20 + i * 14}%`, left: `${8 + i * 18}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 5 + i * 1.5, repeat: Infinity, delay: i * 0.7 }} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
    </div>
  )
}

/* Simple reveal hook — sets visible when element enters viewport */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Start visible after a short delay as fallback
    const fallback = setTimeout(() => setVisible(true), 800)
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); clearTimeout(fallback) }
    }, { threshold: 0.05 })
    obs.observe(el)
    return () => { obs.disconnect(); clearTimeout(fallback) }
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}>
      {children}
    </div>
  )
}

const features = [
  { icon: Mic, title: 'Voice Training', description: 'Talk naturally via Gemini Live. It learns your knowledge, personality, and communication style through real conversations.' },
  { icon: Brain, title: '3D AI Avatar', description: 'Upload a photo — AI generates a stylized 3D avatar with idle, speaking, and thinking animations. Your visual identity, on-chain.' },
  { icon: Zap, title: 'Actions & Delegation', description: 'Your Elit posts tweets, writes code, responds to messages — with scoped, time-limited delegations you fully control.' },
  { icon: Shield, title: 'On-Chain Verification', description: 'Personality hash stored on Solana. Anyone can verify your Elit is authorized. One transaction to revoke everything.' },
  { icon: Fingerprint, title: 'Agent Leveling & XP', description: 'Your Elit levels up as you train it. Track capabilities across knowledge, communication, actions, trust, and creativity.' },
  { icon: Lock, title: 'Agent Marketplace', description: 'Browse verified agents, use templates, or fork existing Elits. A living economy of AI agents on Solana.' },
]

const steps = [
  { num: '01', title: 'Create or Browse', desc: 'Build from scratch or fork a template from the marketplace. Connect your Solana wallet.', icon: Fingerprint },
  { num: '02', title: 'Train Your Agent', desc: 'Chat or call your Elit via Gemini Live. It learns your knowledge, personality, and style.', icon: Mic },
  { num: '03', title: 'Level Up', desc: 'Earn XP, unlock milestones, and watch your agent\'s capabilities grow with every interaction.', icon: Brain },
  { num: '04', title: 'Deploy & Verify', desc: 'Personality hash goes on-chain. Your Elit is live, verifiable, and acting on your behalf.', icon: Globe },
]

const stats = [
  { label: 'AI Agents Created', value: 2847, suffix: '+' },
  { label: 'On-Chain Verifications', value: 12500, suffix: '+' },
  { label: 'Training Sessions', value: 48000, suffix: '+' },
  { label: 'Uptime', value: 99, suffix: '.9%' },
]

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-black">
      {/* ──── HERO ──── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <AmbientBackground />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-500/15 bg-amber-500/5 text-[12px] text-amber-300/60 mb-10 cursor-default">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
              </span>
              Built on Solana · Colosseum Agent Hackathon
              <ChevronRight className="w-3 h-3 text-amber-400/30" />
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.03em] leading-[0.92] mb-8">
            <span className="gradient-text-white">Your AI Agent,</span><br />
            <span className="gradient-text">Verified on Solana</span>
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl max-w-xl mx-auto mb-4 leading-relaxed font-light">
            <TypingText texts={["Teach it by voice. Let it act for you.", "Your knowledge, verified on-chain.", "A digital twin that thinks like you.", "Delegate. Verify. Trust."]} />
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.35 }}
            className="text-[13px] text-white/40 max-w-md mx-auto mb-12 leading-relaxed">
            Create a verifiable AI version of yourself — with cryptographic proof of authorization on Solana.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/create"
              className="beam-btn group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500/10 text-amber-200 font-medium text-sm hover:bg-amber-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <Sparkles className="w-3.5 h-3.5 opacity-70" /> Create Your Elit
              <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-80 transition-all" />
            </Link>
            <Link href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/50 font-medium text-sm hover:bg-white/[0.06] hover:border-white/15 hover:text-white/70 transition-all">
              How It Works
            </Link>
          </motion.div>

          {/* Orb */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-24 flex justify-center">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <div className="absolute inset-0 rounded-full border border-amber-500/5 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-amber-500/8" style={{ animation: 'spin-slow 18s linear infinite reverse' }} />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-500/10 blur-3xl animate-pulse-glow" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-amber-500/5 to-amber-600/5 backdrop-blur-xl border border-amber-500/10" />
              <div className="absolute inset-14 rounded-full bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-amber-500/15 animate-float flex items-center justify-center">
                <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400/50" />
              </div>
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.div key={deg} className="absolute w-1 h-1 rounded-full bg-amber-400/40"
                  style={{ top: '50%', left: '50%' }}
                  animate={{
                    x: [Math.cos(deg * Math.PI / 180) * 90, Math.cos((deg + 360) * Math.PI / 180) * 90],
                    y: [Math.sin(deg * Math.PI / 180) * 90, Math.sin((deg + 360) * Math.PI / 180) * 90],
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: i * 0.4 }} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──── STATS ──── */}
      <section className="py-20 px-4 border-y border-amber-500/8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1.5 tracking-tight">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-[11px] text-white/35 uppercase tracking-widest font-medium">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── FEATURES ──── */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-20">
            <p className="text-[11px] font-medium text-amber-400/50 uppercase tracking-[0.2em] mb-4">Capabilities</p>
            <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-5 tracking-tight">Everything Your Elit Can Do</h2>
            <p className="text-white/50 text-base max-w-lg mx-auto font-light leading-relaxed">
              A full AI replica of yourself, powered by advanced language models and secured by Solana.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.06}>
                <div className="group beam-border beam-border-hover p-7 rounded-2xl cursor-default hover:bg-white/[0.03] transition-all duration-500 h-full">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center mb-5 group-hover:bg-amber-500/12 group-hover:border-amber-500/25 transition-all duration-500">
                    <feature.icon className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400/80 transition-colors duration-500" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white/80 mb-2 group-hover:text-white transition-colors duration-500">{feature.title}</h3>
                  <p className="text-white/45 text-[13px] leading-relaxed font-light">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──── */}
      <section id="how-it-works" className="py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-20">
            <p className="text-[11px] font-medium text-amber-400/50 uppercase tracking-[0.2em] mb-4">Process</p>
            <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-5 tracking-tight">How It Works</h2>
            <p className="text-white/50 text-base font-light">Four steps to your verified AI agent.</p>
          </Reveal>

          <div className="relative space-y-5">
            <div className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-amber-500/20 via-amber-500/8 to-transparent hidden sm:block" />
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.1}>
                <div className="relative flex items-start gap-5 group">
                  <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-white/[0.03] border border-amber-500/10 flex items-center justify-center group-hover:border-amber-500/25 group-hover:bg-amber-500/5 transition-all duration-500">
                    <step.icon className="w-5 h-5 text-white/30 group-hover:text-amber-400/60 transition-colors duration-500" />
                  </div>
                  <div className="flex-1 pb-2 pt-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-mono text-amber-500/40">{step.num}</span>
                      <h3 className="text-[15px] font-semibold text-white/80">{step.title}</h3>
                    </div>
                    <p className="text-white/45 text-[13px] leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── MARKETPLACE TEASER ──── */}
      <section className="py-32 px-4 border-t border-amber-500/8">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-[11px] font-medium text-amber-400/50 uppercase tracking-[0.2em] mb-4">Ecosystem</p>
            <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-5 tracking-tight">Agent Marketplace</h2>
            <p className="text-white/50 text-base max-w-lg mx-auto font-light leading-relaxed">
              Browse verified agents, use templates, or fork existing Elits. A living economy of AI agents — each one unique, each one on-chain.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { value: '2,847+', label: 'Active Agents' },
              { value: '12.3K', label: 'Daily Actions' },
              { value: '48K+', label: 'Templates Used' },
              { value: '$0', label: 'To Get Started' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06}>
                <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-lg font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2} className="text-center">
            <Link href="/explore"
              className="beam-btn group inline-flex items-center gap-2 px-8 py-3.5 bg-white/[0.04] text-white/60 font-medium text-sm hover:bg-white/[0.06] hover:text-white/80 transition-all duration-300">
              <Globe className="w-3.5 h-3.5 opacity-60" />
              Explore Marketplace
              <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 group-hover:opacity-70 transition-all" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ──── TRY IT ──── */}
      <section className="py-32 px-4 border-t border-amber-500/8">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-[11px] font-medium text-amber-400/50 uppercase tracking-[0.2em] mb-4">Experience</p>
            <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-5 tracking-tight">Try It Yourself</h2>
            <p className="text-white/50 text-base max-w-lg mx-auto font-light leading-relaxed">
              Create your Elit in minutes. No cost, no commitment — just connect your wallet and start.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/explore', icon: Globe, title: 'Browse Marketplace', desc: 'Explore verified agents and templates across 6 categories.' },
              { href: '/create', icon: Sparkles, title: 'Create Your Elit', desc: 'Define your personality and generate a 3D avatar in 4 easy steps.' },
              { href: '/train', icon: Mic, title: 'Train by Voice', desc: 'Have a live conversation with Gemini to teach your agent your skills.' },
              { href: '/turing', icon: Eye, title: 'Take the Turing Test', desc: 'Can you tell the AI from the human? 5 rounds, blind comparison.' },
            ].map((item, i) => (
              <Reveal key={item.href} delay={i * 0.08}>
                <Link href={item.href} className="group block beam-border beam-border-hover p-7 rounded-2xl hover:bg-white/[0.03] transition-all duration-500 h-full">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center mb-5 group-hover:bg-amber-500/12 group-hover:border-amber-500/25 group-hover:scale-105 transition-all duration-500">
                    <item.icon className="w-4 h-4 text-amber-400/60" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white/80 mb-2 group-hover:text-white transition-colors duration-500">{item.title}</h3>
                  <p className="text-white/45 text-[13px] leading-relaxed font-light">{item.desc}</p>
                  <div className="mt-5 flex items-center gap-1 text-[12px] text-amber-400/40 group-hover:text-amber-400/70 transition-colors duration-500">
                    Try now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-500" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA ──── */}
      <section className="py-32 px-4">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="relative beam-border rounded-3xl p-12 sm:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-amber-600/[0.04]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-amber-500/8 blur-[120px] rounded-full" />
              <div className="relative">
                <Sparkles className="w-6 h-6 text-amber-400/40 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-5 leading-tight tracking-tight">
                  Ready to Create<br />Your Agent?
                </h2>
                <p className="text-white/50 text-sm sm:text-base mb-10 max-w-sm mx-auto font-light leading-relaxed">
                  Your knowledge deserves to live beyond a single conversation. Deploy a verifiable AI that carries your expertise.
                </p>
                <Link href="/create"
                  className="beam-btn group inline-flex items-center gap-2 px-10 py-4 bg-amber-500/10 text-amber-200 font-semibold text-base hover:bg-amber-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  <Sparkles className="w-4 h-4 opacity-60" /> Create Your Elit
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 group-hover:opacity-70 transition-all" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-amber-500/8 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/30">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-black" fill="currentColor" />
            </div>
            <span className="font-medium text-white/40">Elits AI</span>
          </div>
          <p>Built for Colosseum Agent Hackathon · Powered by Solana & Gemini</p>
        </div>
      </footer>
    </div>
  )
}
