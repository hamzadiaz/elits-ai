'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AgentCard, type AgentTemplate } from '@/components/AgentCard'
import { Search, Sparkles, TrendingUp, Users, ShieldCheck, Zap, Filter, Grid3x3, LayoutGrid, ArrowRight, Brain, Code, BarChart3, Palette, MessageSquare, Globe } from 'lucide-react'

const CATEGORIES = [
  { id: 'all', name: 'All Agents', icon: Grid3x3 },
  { id: 'creator', name: 'Creator', icon: Palette },
  { id: 'developer', name: 'Developer', icon: Code },
  { id: 'trader', name: 'Trader', icon: BarChart3 },
  { id: 'researcher', name: 'Researcher', icon: Brain },
  { id: 'social', name: 'Social Media', icon: MessageSquare },
  { id: 'business', name: 'Business', icon: Globe },
]

const FEATURED_AGENTS: AgentTemplate[] = [
  {
    id: 'feat-1',
    name: 'CryptoSage',
    bio: 'DeFi analyst and on-chain intelligence expert. Tracks whale movements, yield opportunities, and market sentiment across Solana.',
    category: 'trader',
    skills: ['DeFi', 'Solana', 'On-Chain Analysis', 'Trading', 'Risk Management'],
    xp: 2800,
    uses: 12400,
    verified: true,
    featured: true,
    creator: 'HzD...x4K',
  },
  {
    id: 'feat-2',
    name: 'DevCompanion',
    bio: 'Full-stack developer clone specialized in React, TypeScript, and Solana programs. Reviews code, writes tests, debugs issues.',
    category: 'developer',
    skills: ['TypeScript', 'React', 'Solana', 'Rust', 'Testing'],
    xp: 3200,
    uses: 8900,
    verified: true,
    featured: true,
    creator: 'abc...xyz',
  },
  {
    id: 'feat-3',
    name: 'ContentMuse',
    bio: 'Creative writer and social media strategist. Crafts viral threads, engaging posts, and compelling narratives in your authentic voice.',
    category: 'creator',
    skills: ['Writing', 'Social Media', 'Storytelling', 'Marketing', 'Branding'],
    xp: 1900,
    uses: 15700,
    verified: true,
    featured: true,
    creator: 'mno...pqr',
  },
]

const TEMPLATE_AGENTS: AgentTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'ResearchBot',
    bio: 'Academic researcher that synthesizes papers, finds citations, and generates literature reviews across any domain.',
    category: 'researcher',
    skills: ['Research', 'Writing', 'Analysis', 'Citations'],
    xp: 800,
    uses: 3200,
    verified: true,
  },
  {
    id: 'tmpl-2',
    name: 'SalesAgent',
    bio: 'B2B sales specialist. Drafts cold emails, follow-ups, and proposals in a persuasive yet authentic tone.',
    category: 'business',
    skills: ['Sales', 'Email', 'Persuasion', 'CRM'],
    xp: 1200,
    uses: 5600,
    verified: true,
  },
  {
    id: 'tmpl-3',
    name: 'CodeReviewer',
    bio: 'Senior engineer that reviews PRs, suggests improvements, catches bugs, and enforces best practices.',
    category: 'developer',
    skills: ['Code Review', 'TypeScript', 'Python', 'Best Practices'],
    xp: 1500,
    uses: 7100,
    verified: true,
  },
  {
    id: 'tmpl-4',
    name: 'TweetCrafter',
    bio: 'Viral tweet machine. Understands engagement patterns, hooks, and thread structures for maximum reach.',
    category: 'social',
    skills: ['Twitter', 'Copywriting', 'Engagement', 'Growth'],
    xp: 950,
    uses: 22300,
    verified: false,
  },
  {
    id: 'tmpl-5',
    name: 'DeFi Navigator',
    bio: 'Navigates DeFi protocols, finds yield opportunities, and explains complex tokenomics in simple terms.',
    category: 'trader',
    skills: ['DeFi', 'Yield Farming', 'Tokenomics', 'Solana'],
    xp: 1800,
    uses: 4500,
    verified: true,
  },
  {
    id: 'tmpl-6',
    name: 'DesignCritic',
    bio: 'UI/UX design expert. Reviews interfaces, suggests improvements, and generates design system recommendations.',
    category: 'creator',
    skills: ['UI/UX', 'Design Systems', 'Accessibility', 'Figma'],
    xp: 700,
    uses: 2100,
    verified: false,
  },
  {
    id: 'tmpl-7',
    name: 'DataAnalyst',
    bio: 'Crunches numbers, builds dashboards, and extracts actionable insights from any dataset you throw at it.',
    category: 'researcher',
    skills: ['Data Analysis', 'SQL', 'Python', 'Visualization'],
    xp: 1100,
    uses: 3800,
    verified: true,
  },
  {
    id: 'tmpl-8',
    name: 'EmailPro',
    bio: 'Professional email writer that matches your tone perfectly. From cold outreach to investor updates.',
    category: 'business',
    skills: ['Email', 'Professional Writing', 'Communication'],
    xp: 600,
    uses: 9400,
    verified: false,
  },
  {
    id: 'tmpl-9',
    name: 'ThreadWeaver',
    bio: 'Long-form thread specialist. Turns complex topics into engaging, educational Twitter/X threads.',
    category: 'social',
    skills: ['Threads', 'Education', 'Storytelling', 'X/Twitter'],
    xp: 850,
    uses: 6700,
    verified: true,
  },
]

const PLATFORM_STATS = [
  { label: 'Active Agents', value: '2,847', icon: Users },
  { label: 'On-Chain Verified', value: '1,250', icon: ShieldCheck },
  { label: 'Templates Used', value: '48K+', icon: LayoutGrid },
  { label: 'Actions/Day', value: '12.3K', icon: Zap },
]

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

export default function ExplorePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'level'>('popular')

  const allAgents = [...TEMPLATE_AGENTS]
  const filtered = allAgents
    .filter(a => category === 'all' || a.category === category)
    .filter(a =>
      !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      a.bio.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.uses - a.uses
      if (sortBy === 'level') return b.xp - a.xp
      return 0
    })

  const handleUseTemplate = (agent: AgentTemplate) => {
    // Pre-fill create flow with template data
    const templateProfile = {
      name: '',
      bio: agent.bio,
      skills: agent.skills,
      interests: [],
      values: [],
      communicationStyle: { formality: 'balanced', humor: 'playful', verbosity: 'balanced', tone: '' },
      trainingMessages: [],
      knowledgeGraph: [],
      personalityTraits: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
      trainingSessions: [],
      writingStyle: { avgSentenceLength: 'medium', vocabulary: 'moderate', usesEmoji: false, usesSlang: false, favoriteExpressions: [] },
      totalTrainingMinutes: 0,
      templateId: agent.id,
      templateName: agent.name,
    }
    localStorage.setItem('elitTemplate', JSON.stringify(templateProfile))
    router.push('/create')
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-12 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[200px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-[200px]" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/15 bg-amber-500/5 text-[11px] text-amber-300/50 mb-6">
                <Sparkles className="w-3 h-3" />
                Agent Marketplace
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold gradient-text-white mb-4 tracking-tight">
                Explore Elits
              </h1>
              <p className="text-white/40 text-[15px] max-w-lg mx-auto font-light leading-relaxed">
                Browse verified AI agents, use templates, or fork existing Elits to create your own.
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
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="elite-input text-[12px] cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="level">Highest Level</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </Reveal>

          {/* Categories */}
          <Reveal delay={0.2}>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-8 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    category === cat.id
                      ? 'bg-amber-500/[0.1] text-amber-300/70 border border-amber-500/25'
                      : 'bg-white/[0.03] text-white/35 border border-white/[0.06] hover:text-white/50 hover:border-white/[0.08]'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-300/30" />
                <h2 className="text-[15px] font-semibold text-white/60">Featured Elits</h2>
              </div>
              <span className="text-[10px] text-white/20 uppercase tracking-wider">Top Performers</span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {FEATURED_AGENTS.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} onUse={handleUseTemplate} delay={i * 0.08} />
            ))}
          </div>

          {/* All Templates */}
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-300/30" />
                <h2 className="text-[15px] font-semibold text-white/60">
                  {category === 'all' ? 'All Templates' : CATEGORIES.find(c => c.id === category)?.name + ' Templates'}
                </h2>
                <span className="text-[11px] text-white/20 ml-2">{filtered.length} agents</span>
              </div>
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={category + sortBy}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filtered.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} onUse={handleUseTemplate} delay={i * 0.05} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Search className="w-8 h-8 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-[14px] mb-2">No agents found</p>
                <p className="text-white/15 text-[12px]">Try a different search or category</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 border-t border-amber-500/8">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="relative beam-border rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-amber-600/[0.03]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] h-[120px] bg-amber-500/6 blur-[100px] rounded-full" />
              <div className="relative">
                <Sparkles className="w-5 h-5 text-amber-400/40 mx-auto mb-5" />
                <h2 className="text-2xl sm:text-3xl font-bold gradient-text-white mb-4 tracking-tight">
                  Build Your Own Elit
                </h2>
                <p className="text-white/40 text-[13px] mb-8 max-w-sm mx-auto font-light leading-relaxed">
                  Start from scratch or fork a template. Train it with your knowledge, verify it on Solana, and let it work for you.
                </p>
                <a href="/create" className="group inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.02] transition-all">
                  <Sparkles className="w-3.5 h-3.5 opacity-60" />
                  Create Your Elit
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
