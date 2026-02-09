# Elits AI — Integration Plan (Research → Hackathon)
*Created: Feb 9, 2026 | Deadline: Feb 12, 2026*

---

## Strategy: Win the Hackathon with "Verifiable AI Agent Economy"

The research shows 5 massive gaps in the market. Elits AI already covers #6 (blockchain ownership). We need to add signals for the other gaps to prove we're building THE platform.

### Research Gaps → Elits Integration

| Gap | How Elits Shows It | Priority |
|-----|--------------------|----------|
| Point-and-teach training | Voice training already exists; add guided training milestones | P3 |
| Agents that DO stuff | Actions already work; add more action types + visual results | P4 |
| Addictive/sticky UX | **NEW: XP system, agent levels, capability scores** | P2 |
| Marketplace/templates | **NEW: Explore page with agent gallery + templates** | P1 |
| Blockchain ownership | Already exists; on-chain create/verify/delegate working | Existing |

---

## Implementation Status

### ✅ COMPLETED (Feb 9 Sprint)

| Feature | Status | Files |
|---------|--------|-------|
| Agent Marketplace `/explore` page | ✅ Done | `app/explore/page.tsx` |
| XP & Leveling System | ✅ Done | `lib/xp.ts` |
| Capability Radar Chart | ✅ Done | `components/CapabilityChart.tsx` |
| Level Badge component | ✅ Done | `components/LevelBadge.tsx` |
| XP Progress Bar component | ✅ Done | `components/XPBar.tsx` |
| Agent Card component | ✅ Done | `components/AgentCard.tsx` |
| Dashboard: XP + Capabilities + Milestones | ✅ Done | `app/dashboard/page.tsx` |
| Verify page: Level + Capabilities | ✅ Done | `app/verify/[id]/page.tsx` |
| Training page: Milestones + XP | ✅ Done | `app/train/page.tsx` |
| Landing page: Marketplace section | ✅ Done | `app/page.tsx` |
| Navbar: Explore link | ✅ Done | `components/Navbar.tsx` |
| Create page: Template pre-fill | ✅ Done | `app/create/page.tsx` |
| OG image SVG | ✅ Done | `public/og-image.svg` |
| Favicon SVG | ✅ Done | `public/favicon.svg` |

### 🔲 Remaining (Day 2-3)

| Feature | Priority | Estimate |
|---------|----------|----------|
| Deploy Anchor program to devnet | P1 | 1h |
| Real-time XP toast notifications | P3 | 2h |
| Agent leveling up animation | P3 | 1h |
| Share agent card as image | P4 | 2h |
| Mobile responsive testing | P2 | 2h |
| Demo video recording | P1 | 3h |
| Colosseum forum post | P1 | 1h |

---

## Implementation Plan (Original)

### ✅ Phase 1: Agent Marketplace/Explore Page (P1 — HIGHEST IMPACT)
**Why:** Judges need to see the VISION. A marketplace shows this isn't just a single-agent tool — it's a platform/economy.

**What to build:**
- `/explore` page — Grid of agent templates/featured agents
- Categories: Creator, Developer, Trader, Researcher, Social Media
- Each card shows: avatar, name, skills, level, trust score, # of uses
- "Use Template" button → pre-fills create flow
- "Featured Elits" spotlight section
- Search and filter by category/skill
- Stats bar: total agents, total verifications, total actions

### ✅ Phase 2: XP & Agent Leveling System (P2 — STICKINESS)
**Why:** Research says gamification = retention. Agent leveling is the #1 requested feature across platforms.

**What to build:**
- XP system: earn XP for training messages, voice sessions, actions, turing tests
- Agent Level 1-50 with named tiers (Novice → Apprentice → Expert → Master → Elite)
- Capability radar chart (Knowledge, Communication, Actions, Trust, Creativity)
- XP progress bar on dashboard + profile
- Level badge on avatar
- Stats card on verify page showing agent capabilities

### ✅ Phase 3: Training UX Improvements (P3)
**Why:** The training flow works but needs "wow factor" for demo.

**What to build:**
- Training milestones: "Teach your Elit about your work" → "Share your opinions" → "Practice your style"
- Progress badges for completing categories
- Real-time skill detection display during training
- Training completion celebration animation

### ✅ Phase 4: Demo Polish (P4)
**Why:** First impressions win hackathons.

**What to build:**
- OG image (SVG-based, works everywhere)
- Enhanced page transitions
- Improved not-found page
- Navbar update with Explore link
- Mobile refinements

---

## Files to Create/Modify

### New Files:
- `src/app/explore/page.tsx` — Marketplace/explore page
- `src/lib/xp.ts` — XP system logic (levels, calculations, capability scores)
- `src/components/XPBar.tsx` — Reusable XP progress bar
- `src/components/LevelBadge.tsx` — Agent level badge
- `src/components/CapabilityChart.tsx` — Radar chart for agent capabilities
- `src/components/AgentCard.tsx` — Card for marketplace grid
- `public/og-image.svg` — OG image

### Modified Files:
- `src/components/Navbar.tsx` — Add Explore link
- `src/app/dashboard/page.tsx` — Add XP bar, level, stats
- `src/app/verify/[id]/page.tsx` — Add capability chart, level badge
- `src/app/create/page.tsx` — Template pre-fill support
- `src/app/train/page.tsx` — Training milestones
- `src/app/page.tsx` — Add marketplace teaser section

---

## Success Criteria

For the hackathon demo, judges should see:
1. ✅ Create an Elit (already works)
2. ✅ Voice train it (already works)
3. ✅ On-chain verification (already works)
4. 🆕 Browse agent marketplace (templates + featured agents)
5. 🆕 Agent leveling up with XP after training
6. 🆕 Capability radar showing agent strengths
7. ✅ Turing test (already works)
8. ✅ Kill switch (already works)

**The pitch:** "Not just a chatbot wrapper — it's a verifiable AI agent economy on Solana, with training, leveling, marketplace, and on-chain trust."
