'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const features = [
  {
    icon: '🎙️',
    title: 'Voice Training',
    description: 'Talk to your Elit naturally. It learns your knowledge, skills, personality, and communication style through conversation.',
  },
  {
    icon: '🧠',
    title: 'AI Personality Engine',
    description: 'Your Elit builds a deep model of who you are — your expertise, values, decision-making patterns, and unique voice.',
  },
  {
    icon: '⚡',
    title: 'Act On Your Behalf',
    description: 'Your Elit posts, codes, responds, and researches — all in your authentic style with delegated permissions.',
  },
  {
    icon: '🔐',
    title: 'Verified on Solana',
    description: 'On-chain proof that your Elit is authorized by YOU. Anyone can verify. One transaction to revoke.',
  },
  {
    icon: '🎭',
    title: '3D Avatar',
    description: 'Your profile pic becomes a living, animated avatar that represents your Elit across the internet.',
  },
  {
    icon: '🔑',
    title: 'Scoped Delegation',
    description: 'Fine-grained control over what your Elit can do. Chat only, post only, or full autonomy — your choice.',
  },
]

const steps = [
  { num: '01', title: 'Connect Wallet', desc: 'Link your Solana wallet to establish your on-chain identity.' },
  { num: '02', title: 'Create Your Elit', desc: 'Name it, describe it, set its initial personality parameters.' },
  { num: '03', title: 'Train by Talking', desc: 'Have conversations with your Elit. It learns more with every interaction.' },
  { num: '04', title: 'Verify & Deploy', desc: 'Personality hash goes on-chain. Your Elit is live and verifiable.' },
]

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-light mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Built on Solana · Colosseum Agent Hackathon
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="text-white">Your AI Clone,</span>
            <br />
            <span className="gradient-text">Verified on Solana</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Teach it by voice. Let it act for you. Create a verifiable AI version of yourself 
            that thinks, speaks, and acts exactly like you — with on-chain proof.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/create"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-lg glow hover:scale-105 transition-transform"
            >
              Create Your Elit →
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl glass glass-hover text-white font-semibold text-lg hover:scale-105 transition-transform"
            >
              How It Works
            </Link>
          </motion.div>

          {/* Floating orb visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-30 blur-xl animate-pulse-glow" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 backdrop-blur-xl border border-white/10" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 animate-float flex items-center justify-center">
                <span className="text-4xl sm:text-5xl">🧠</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Everything Your Elit Can Do
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A full AI replica of yourself, powered by advanced language models and secured on Solana.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass glass-hover p-6 rounded-2xl group cursor-default"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-light transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">Four steps to your verifiable AI clone.</p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-6 glass p-6 rounded-2xl"
              >
                <div className="text-4xl font-bold gradient-text shrink-0">{step.num}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Ready to Clone Yourself?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Your knowledge deserves to live beyond a single conversation. Create an Elit that carries your expertise, personality, and authority — verified on-chain.
            </p>
            <Link
              href="/create"
              className="inline-block px-10 py-5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xl glow hover:scale-105 transition-transform"
            >
              Create Your Elit Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent" />
            <span>Elits AI</span>
          </div>
          <p>Built for Colosseum Agent Hackathon · Powered by Solana & Gemini</p>
        </div>
      </footer>
    </div>
  )
}
