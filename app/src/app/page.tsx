'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { Mic, Brain, Zap, Shield, Sparkles, ArrowRight, ChevronRight, Cpu, Fingerprint, Globe } from 'lucide-react'

// Animated counter component
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => `${Math.round(v).toLocaleString()}${suffix}`)
  const [display, setDisplay] = useState(`0${suffix}`)

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, { duration: 2, ease: 'easeOut' })
      const unsub = rounded.on('change', v => setDisplay(v))
      return () => { controls.stop(); unsub() }
    }
  }, [isInView, target, count, rounded])

  return <span ref={ref}>{display}</span>
}

// Typing effect
function TypingText({ texts }: { texts: string[] }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[index]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1))
        } else {
          setTimeout(() => setDeleting(true), 2000)
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1))
        } else {
          setDeleting(false)
          setIndex((index + 1) % texts.length)
        }
      }
    }, deleting ? 30 : 60)
    return () => clearTimeout(timeout)
  }, [text, deleting, index, texts])

  return (
    <span className="text-gray-400">
      {text}
      <span className="cursor-blink text-primary">|</span>
    </span>
  )
}

// Floating particles background
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary-dark/20 rounded-full blur-[160px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-blue/15 rounded-full blur-[160px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[200px]" />
      
      {/* Floating dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 16}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Grid fade overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
    </div>
  )
}

const features = [
  {
    icon: Mic,
    title: 'Voice Training',
    description: 'Talk naturally to your Elit via Gemini Live. It learns your knowledge, personality, and unique communication style through real conversations.',
    gradient: 'from-purple-500/20 to-blue-500/20',
    glow: 'group-hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]',
  },
  {
    icon: Brain,
    title: '3D AI Avatar',
    description: 'Upload a photo and AI generates a stylized 3D avatar with idle, speaking, and thinking animations. Your visual identity on-chain.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    glow: 'group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]',
  },
  {
    icon: Zap,
    title: 'Actions & Delegation',
    description: 'Your Elit posts tweets, writes code, responds to messages — with scoped, time-limited delegations you fully control.',
    gradient: 'from-cyan-500/20 to-emerald-500/20',
    glow: 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
  },
  {
    icon: Shield,
    title: 'On-Chain Verification',
    description: 'Personality hash stored on Solana. Anyone can verify your Elit is authorized by you. One transaction to revoke everything.',
    gradient: 'from-emerald-500/20 to-yellow-500/20',
    glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
  },
  {
    icon: Fingerprint,
    title: 'Turing Test',
    description: 'Can people tell the difference? Blind comparison between you and your Elit proves how authentic your AI clone really is.',
    gradient: 'from-yellow-500/20 to-pink-500/20',
    glow: 'group-hover:shadow-[0_0_40px_rgba(234,179,8,0.15)]',
  },
  {
    icon: Globe,
    title: 'Emergency Kill Switch',
    description: 'Full control over your clone. Revoke all delegations, disable actions instantly. Your AI, your rules.',
    gradient: 'from-pink-500/20 to-purple-500/20',
    glow: 'group-hover:shadow-[0_0_40px_rgba(236,72,153,0.15)]',
  },
]

const steps = [
  {
    num: '01',
    title: 'Connect Wallet',
    desc: 'Link your Solana wallet to establish your cryptographic identity.',
    icon: Fingerprint,
  },
  {
    num: '02',
    title: 'Create Your Elit',
    desc: 'Define your personality, skills, interests, and communication style.',
    icon: Cpu,
  },
  {
    num: '03',
    title: 'Train by Talking',
    desc: 'Have conversations. Your Elit gets smarter with every interaction.',
    icon: Mic,
  },
  {
    num: '04',
    title: 'Deploy & Verify',
    desc: 'Personality hash goes on-chain. Your Elit is live and verifiable globally.',
    icon: Globe,
  },
]

const stats = [
  { label: 'AI Agents Created', value: 2847, suffix: '+' },
  { label: 'On-Chain Verifications', value: 12500, suffix: '+' },
  { label: 'Training Sessions', value: 48000, suffix: '+' },
  { label: 'Uptime', value: 99, suffix: '.9%' },
]

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.08 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-black">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <ParticleField />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-sm text-gray-400 mb-8 hover:border-primary/30 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              Built on Solana · Colosseum Agent Hackathon
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-7"
          >
            <span className="gradient-text-white">Your AI Clone,</span>
            <br />
            <span className="gradient-text">Verified on Solana</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            <TypingText texts={[
              "Teach it by voice. Let it act for you.",
              "Your knowledge, verified on-chain.",
              "A digital twin that thinks like you.",
              "Delegate. Verify. Trust."
            ]} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm text-gray-600 max-w-lg mx-auto mb-10"
          >
            Create a verifiable AI version of yourself that thinks, speaks, and acts exactly like you — with cryptographic proof of authorization.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/create"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-dark via-primary to-blue text-white font-semibold text-base btn-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Create Your Elit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-gray-300 font-medium text-base hover:bg-white/[0.05] hover:border-white/[0.15] hover:text-white transition-all"
            >
              How It Works
            </Link>
          </motion.div>

          {/* Abstract AI visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 flex justify-center"
          >
            <div className="relative w-56 h-56 sm:w-72 sm:h-72">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-white/[0.04] animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-white/[0.06]" style={{ animation: 'spin-slow 15s linear infinite reverse' }} />
              
              {/* Glowing core */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-blue/10 to-accent/20 blur-2xl animate-pulse-glow" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl border border-white/[0.06]" />
              <div className="absolute inset-14 rounded-full bg-gradient-to-br from-primary/30 via-blue/20 to-accent/30 animate-float flex items-center justify-center">
                <Brain className="w-10 h-10 sm:w-14 sm:h-14 text-white/80" />
              </div>

              {/* Orbiting dots */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.div
                  key={deg}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [Math.cos((deg + 0) * Math.PI / 180) * 100, Math.cos((deg + 360) * Math.PI / 180) * 100],
                    y: [Math.sin((deg + 0) * Math.PI / 180) * 100, Math.sin((deg + 360) * Math.PI / 180) * 100],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium text-primary-light/70 uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-4">
              Everything Your Elit Can Do
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A full AI replica of yourself, powered by advanced language models and secured by Solana.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className={`group gradient-border p-7 rounded-2xl cursor-default transition-all duration-300 ${feature.glow}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 border border-white/[0.06]`}>
                  <feature.icon className="w-5 h-5 text-white/80" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:gradient-text transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium text-primary-light/70 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 text-lg">Four steps to your verifiable AI clone.</p>
          </motion.div>

          <div className="relative space-y-6">
            {/* Connecting line */}
            <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-primary/30 via-blue/30 to-accent/30 hidden sm:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative flex items-start gap-6 group"
              >
                {/* Step number circle */}
                <div className="relative shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] transition-all duration-300">
                  <step.icon className="w-6 h-6 text-gray-400 group-hover:text-primary-light transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-primary/60">{step.num}</span>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Try It / Live Demo */}
      <section className="py-28 px-4 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-medium text-primary-light/70 uppercase tracking-widest mb-3">Experience</p>
            <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-4">
              Try It Yourself
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Create your Elit in minutes. No cost, no commitment — just connect your wallet and start.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {[
              { href: '/create', icon: Sparkles, title: 'Create Your Elit', desc: 'Define your personality and generate a 3D avatar in 4 easy steps.', gradient: 'from-primary/10 to-blue/10' },
              { href: '/train', icon: Mic, title: 'Train by Voice', desc: 'Have a live conversation with Gemini to teach your clone who you are.', gradient: 'from-blue/10 to-cyan-500/10' },
              { href: '/turing', icon: Fingerprint, title: 'Take the Turing Test', desc: 'Can you tell the AI from the human? 5 rounds, blind comparison.', gradient: 'from-cyan-500/10 to-accent/10' },
            ].map((item) => (
              <motion.div key={item.href} variants={fadeUp} transition={{ duration: 0.5 }}>
                <Link
                  href={item.href}
                  className={`group block gradient-border p-7 rounded-2xl hover:shadow-[0_0_40px_rgba(124,58,237,0.1)] transition-all`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 border border-white/[0.06] group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-light transition-colors">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm text-primary-light/70 group-hover:text-primary-light transition-colors">
                    Try now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative gradient-border rounded-3xl p-12 sm:p-16 text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/10 blur-[120px] rounded-full" />

            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary/60 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-5 leading-tight">
                Ready to Clone<br />Yourself?
              </h2>
              <p className="text-gray-500 text-base sm:text-lg mb-10 max-w-md mx-auto">
                Your knowledge deserves to live beyond a single conversation. Deploy a verifiable AI that carries your expertise and authority.
              </p>
              <Link
                href="/create"
                className="group inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-primary-dark via-primary to-blue text-white font-bold text-lg btn-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <Sparkles className="w-5 h-5" />
                Create Your Elit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-primary-dark to-blue flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" fill="white" />
            </div>
            <span className="font-medium text-gray-500">Elits AI</span>
          </div>
          <p>Built for Colosseum Agent Hackathon · Powered by Solana & Gemini</p>
        </div>
      </footer>
    </div>
  )
}
