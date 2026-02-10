'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NFACard } from '@/components/NFACard'
import { DEMO_AGENTS, CATEGORIES, type AgentCategory, type NFAAgent, buyAgent, getOwnedAgents } from '@/lib/agents'
import { useToast } from '@/components/Toast'
import {
  Search, Sparkles, TrendingUp, Users, ShieldCheck, Zap, Grid3x3, LayoutGrid,
  ArrowRight, DollarSign, Star, BarChart3, Code, Palette, MessageSquare, Heart,
  Shield, Brain, Headphones, BookOpen, Scale, UserCheck, Database, Share2,
  Eye, Gamepad2, Languages, Mic, Building2, Briefcase, ChevronLeft, ChevronRight, Crown
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  DeFi: BarChart3, Content: MessageSquare, 'Dev Tools': Code, Research: Brain,
  'Customer Support': Headphones, 'Personal Assistant': UserCheck, Education: BookOpen,
  Legal: Scale, Health: Heart, Creative: Palette, Sales: DollarSign,
  'Data Analysis': Database, 'Social Media': Share2, 'Crypto Intel': Eye,
  Gaming: Gamepad2, Translation: Languages, 'Voice / Persona': Mic,
  DAO: Shield, 'Real Estate': Building2, Recruiting: Briefcase,
}

const PLATFORM_STATS = [
  { label: 'Active NFAs', value: '0', icon: Users },
  { label: 'On-Chain Verified', value: '0', icon: ShieldCheck },
  { label: 'Total Volume', value: '0 SOL', icon: DollarSign },
  { label: 'Active Creators', value: '0', icon: Zap },
]

type SortOption = 'trending' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'revenue' | 'most-used'

const ITEMS_PER_PAGE = 12

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fallback = setTimeout(() => setVisible(true), 800)
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); clearTimeout(fallback) }
    }, { threshold: 0.05 })
    obs.observe(el)
    return () => { obs.disconnect(); clearTimeout(fallback) }
  }, [])
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}>
      {children}
    </div>
  )
}

export default function MarketplacePage() {
  const { addToast, updateToast } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | AgentCategory>('all')
  const [sortBy, setSortBy] = useState<SortOption>('trending')
  const [owned, setOwned] = useState<string[]>([])
  const [page, setPage] = useState(1)

  useEffect(() => { setOwned(getOwnedAgents()) }, [])
  useEffect(() => { setPage(1) }, [search, category, sortBy])

  const featured = DEMO_AGENTS.filter(a => a.rarity === 'legendary')

  const filtered = useMemo(() => {
    return DEMO_AGENTS
      .filter(a => category === 'all' || a.category === category)
      .filter(a =>
        !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'trending': return b.usageCount - a.usageCount
          case 'newest': return 0
          case 'price-low': return a.price - b.price
          case 'price-high': return b.price - a.price
          case 'rating': return b.rating - a.rating
          case 'revenue': return b.revenueGenerated - a.revenueGenerated
          case 'most-used': return b.usageCount - a.usageCount
          default: return 0
        }
      })
  }, [category, search, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleBuy = (agent: NFAAgent) => {
    const toastId = addToast({ type: 'loading', message: `Purchasing ${agent.name}...` })
    setTimeout(() => {
      const sig = buyAgent(agent.id)
      setOwned(getOwnedAgents())
      updateToast(toastId, { type: 'success', message: `${agent.name} acquired!`, txSignature: sig })
    }, 1500)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-12 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[200px]" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/15 bg-amber-500/5 text-[11px] text-amber-300/50 mb-6">
                <Sparkles className="w-3 h-3" />
                NFA Marketplace
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-4 tracking-tight">
                Non-Fungible Agents
              </h1>
              <p className="text-white/40 text-[15px] max-w-lg mx-auto font-light leading-relaxed">
                Own, trade, and earn from unique AI agents on Solana. Every NFA is a yield-bearing digital asset.
              </p>
            </div>
          </Reveal>

          {/* Stats Bar */}
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-2xl mx-auto">
              {PLATFORM_STATS.map(stat => (
                <div key={stat.label} className="text-center px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <stat.icon className="w-3.5 h-3.5 text-amber-300/30 mx-auto mb-1.5" />
                  <div className="text-[15px] font-semibold text-white/70">{stat.value}</div>
                  <div className="text-[9px] text-white/25 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Search & Filter */}
          <Reveal delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search agents, skills, or categories..."
                  className="elite-input w-full pl-11"
                />
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="elite-input text-[12px] cursor-pointer"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Highest Rated</option>
                <option value="revenue">Most Revenue</option>
                <option value="most-used">Most Used</option>
              </select>
            </div>
          </Reveal>

          {/* Categories */}
          <Reveal delay={0.2}>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-8 scrollbar-hide">
              <button
                onClick={() => setCategory('all')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  category === 'all'
                    ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25'
                    : 'bg-white/[0.03] text-white/35 border border-white/[0.06] hover:text-white/50'
                }`}
              >
                <Grid3x3 className="w-3.5 h-3.5" /> All
              </button>
              {CATEGORIES.map(cat => {
                const Icon = CATEGORY_ICONS[cat] || Brain
                const count = DEMO_AGENTS.filter(a => a.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                      category === cat
                        ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25'
                        : 'bg-white/[0.03] text-white/35 border border-white/[0.06] hover:text-white/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {cat}
                    <span className="text-[9px] opacity-50">({count})</span>
                  </button>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Legendary Agents */}
      {category === 'all' && !search && (
        <section className="px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400/40" />
                  <h2 className="text-[15px] font-semibold text-white/60">Legendary NFAs</h2>
                </div>
                <span className="text-[10px] text-white/20 uppercase tracking-wider">Top Performers</span>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
              {featured.map((agent, i) => (
                <NFACard key={agent.id} agent={agent} delay={i * 0.08} onBuy={handleBuy} owned={owned.includes(agent.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Agents */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-300/30" />
                <h2 className="text-[15px] font-semibold text-white/60">
                  {category === 'all' ? 'All NFAs' : category}
                </h2>
                <span className="text-[11px] text-white/20 ml-2">{filtered.length} agents</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-[11px] text-white/30">
                  Page {page} of {totalPages}
                </div>
              )}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {paginated.length > 0 ? (
              <motion.div
                key={category + sortBy + page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {paginated.map((agent, i) => (
                  <NFACard key={agent.id} agent={agent} delay={i * 0.04} onBuy={handleBuy} owned={owned.includes(agent.id)} />
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Search className="w-8 h-8 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-[14px] mb-2">No agents found</p>
                <p className="text-white/15 text-[12px]">Try a different search or category</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/50 disabled:opacity-20 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    p === page
                      ? 'bg-amber-500/[0.15] text-amber-300/70 border border-amber-500/25'
                      : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-white/50 disabled:opacity-20 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 border-t border-amber-500/8">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="relative beam-border rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-amber-600/[0.03]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[120px] bg-amber-500/6 blur-[100px] rounded-full" />
              <div className="relative">
                <Sparkles className="w-5 h-5 text-amber-400/40 mx-auto mb-5" />
                <h2 className="text-2xl sm:text-3xl font-bold gradient-text-white mb-4 tracking-tight">
                  Mint Your Own NFA
                </h2>
                <p className="text-white/40 text-[13px] mb-8 max-w-sm mx-auto font-light leading-relaxed">
                  Create an AI agent, mint it as an NFA on Solana, and earn from every interaction.
                </p>
                <a href="/create" className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.02] transition-all">
                  <Sparkles className="w-3.5 h-3.5 opacity-60" />
                  Create & Mint
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
