# ELITS AI — Master Plan
*Last updated: Feb 9, 2026 — 3 days to hackathon deadline (Feb 12)*

---

## 1. Current State

### ✅ What Works
- **Landing page** — Beautiful dark/gold design, animated hero, stats, features, how-it-works, CTA sections. Professional quality.
- **Create Elit flow** — 4-step wizard (Identity → Skills → Values → Review) with tag selectors, photo upload, communication style picker. Generates personality hash (SHA-256). Stores to localStorage.
- **Train page** — Chat training mode with Gemini 2.0 Flash. Voice training UI with Gemini Live WebSocket integration (phone-call UI).
- **Dashboard** — Overview, actions tab (execute tweet/code/message/research via Gemini), delegations management with mock data.
- **Turing Test** — 5-round blind comparison (AI vs sample human responses). Scoring and results.
- **Verify page** — Shows profile, personality hash, trust score, wallet, delegations, embeddable badge.
- **Chat page** — Talk to any Elit with verified badge, action buttons, dispute feature.
- **API routes** — `/api/chat`, `/api/train`, `/api/avatar`, `/api/actions`, `/api/extract` — all functional with Gemini.
- **Anchor program** — Full Solana program with `create_elit`, `verify_elit`, `delegate`, `revoke_elit`, `revoke_delegation`. Compiled (.so exists).
- **Wallet integration** — Phantom/Solflare via @solana/wallet-adapter.
- **Avatar3D component** — CSS-animated avatar with idle/speaking/thinking states, holographic overlay, glow rings.
- **Build** — Clean `next build` with zero errors.
- **SEO** — Title, description, OG tags, Twitter card, favicon.

### 🐛 Bugs Found
1. **CRITICAL: Program ID mismatch** — `solana.ts` had placeholder `E1itsAiProgramXXX...` instead of actual deployed ID `5RPvUJ1pAQpeADq4QDX179etC3SUmk6q1TFdMYYqGNPF`. **FIXED.**
2. **Missing OG image** — `/public/og-image.png` referenced in metadata but doesn't exist.
3. **Verify page uses localStorage only** — Not actually reading from Solana chain, just localStorage. Works for demo but not real verification.
4. **Dashboard uses mock delegations** — Hardcoded delegation data, not from chain.
5. **Anchor program not deployed to devnet** — `Anchor.toml` says localnet. `.so` file exists but needs devnet deploy.
6. **No actual on-chain transactions** — Create Elit, Delegate, Revoke are UI-only. No `@coral-xyz/anchor` client SDK in frontend.
7. **Avatar generation** — Uses Gemini 2.0 Flash experimental for image gen. May fail; has CSS fallback. Not tested with real photo.
8. **Voice training** — Gemini Live WebSocket needs `GEMINI_API_KEY` server-side. Audio capture/playback implemented but untested in production.
9. **Low text contrast** — Secondary text (`text-white/20`, `text-white/15`) may be too dim for accessibility.

### 📊 Summary
The app is ~70% complete for a hackathon demo. UI is polished, AI features work, but Solana integration is frontend-only (no actual transactions).

---

## 2. Phase Status Analysis

### Phase 1: Foundation ✅ ~85%
| Item | Status | Notes |
|------|--------|-------|
| Elit Registry PDA | ✅ Done | Anchor program written with all accounts |
| Delegation account | ✅ Done | In lib.rs |
| `create_elit` instruction | ✅ Done | |
| `verify_elit` instruction | ✅ Done | |
| `delegate` instruction | ✅ Done | |
| `revoke_elit` instruction | ✅ Done | |
| Deploy to devnet | ❌ Not done | Only compiled, Anchor.toml says localnet |
| Next.js project setup | ✅ Done | Next.js 15 + Tailwind + wallet adapter |
| Landing page | ✅ Done | Beautiful, animated |
| Design system | ✅ Done | Dark/gold glassmorphic with CSS vars |
| Wallet connect flow | ✅ Done | Phantom/Solflare |
| Create Elit page | ✅ Done | 4-step wizard |
| Layout + navigation | ✅ Done | Navbar with all routes |
| Structured intake form | ✅ Done | Skills, interests, values, communication style |
| Chat training interface | ✅ Done | With Gemini 2.0 Flash |
| Basic personality model | ✅ Done | System prompt generation from profile |
| Personality hash generation | ✅ Done | SHA-256 via SubtleCrypto |

### Phase 2: Voice + Avatar 🟡 ~60%
| Item | Status | Notes |
|------|--------|-------|
| WebSocket to Gemini Live | ✅ Done | `geminiLive.ts` client implemented |
| Audio capture | ✅ Done | `AudioCapture` class with MediaRecorder |
| Real-time voice conversation | 🟡 Partial | UI done, needs testing with real API key |
| Knowledge extraction from voice | 🟡 Partial | `/api/extract` route exists |
| Transcript storage | ✅ Done | In-memory, not persisted |
| "Call your Elit" button | ✅ Done | Phone-call UI in VoiceTrainer |
| Profile pic upload | ✅ Done | In create flow |
| Gemini image → stylized avatar | 🟡 Partial | API route exists, uses experimental model |
| Three.js animated display | ❌ Not done | Current Avatar3D is CSS-only, not Three.js |
| Idle animation | ✅ Done | CSS float animation |
| Speaking animation | ✅ Done | Scale pulse + glow ring |
| Thinking animation | ✅ Done | Spinner overlay |
| Avatar as on-chain metadata | ❌ Not done | No URI stored on chain |
| Multi-session memory | ❌ Not done | No persistence between sessions |
| Personality trait scoring | ❌ Not done | |
| Knowledge graph building | ❌ Not done | |
| Writing style analysis | ❌ Not done | |

### Phase 3: Actions + Verification 🟡 ~50%
| Item | Status | Notes |
|------|--------|-------|
| Action types | ✅ Done | post_tweet, write_code, respond_message, research |
| Delegation check | ✅ Done | Scope validation in `/api/actions` |
| Action queue | 🟡 Partial | Execute + display, but no approval mode |
| X/Twitter integration | ❌ Not done | Generates tweet text but doesn't post |
| Code generation | ✅ Done | Via Gemini |
| Message drafting | ✅ Done | Via Gemini |
| Public verification page | ✅ Done | `/verify/[id]` |
| Embeddable badge | ✅ Done | In verify page |
| "Talk to this Elit" button | ✅ Done | Links to chat |
| Interaction log viewer | ❌ Not done | |
| Public chat interface | ✅ Done | `/chat/[id]` |
| Verified badge on chat | ✅ Done | |
| Dispute button | ✅ Done | |
| Delegation dashboard | ✅ Done | UI complete with scopes, expiry, revoke |
| On-chain transactions | ❌ Not done | No Anchor client in frontend |

### Phase 4: Polish + Demo 🟡 ~40%
| Item | Status | Notes |
|------|--------|-------|
| Landing animations | ✅ Done | Framer Motion throughout |
| Turing test mode | ✅ Done | 5-round blind test |
| Mobile responsive | 🟡 Partial | Tailwind responsive classes, untested |
| Error handling | 🟡 Partial | Try/catch in APIs, some UI states |
| SEO + OG tags | 🟡 Partial | Tags set, OG image missing |
| Performance optimization | ❌ Not done | |
| Demo video | ❌ Not done | |
| Deploy to mainnet | ❌ Not done | |
| Hackathon submission | ❌ Not done | |

---

## 3. 3D Avatar System — Implementation Plan

### Recommended Approach: **Option B (Enhanced) — Gemini Stylized Image + CSS 3D + Lip Sync States**

**Why:** Feasible in 3 days, visually impressive, shareable.

#### The Look: "Holographic Neural Portrait"
- **Style:** Semi-translucent, glowing neon contour lines over a stylized face
- **Colors:** Amber/gold primary glow, subtle cyan secondary, deep black background
- **Feel:** Like a hologram from a sci-fi movie — clearly AI, clearly recognizable
- **Inspiration:** Think Iron Man's JARVIS interface meets a cyberpunk portrait

#### Implementation Plan

**Step 1: Avatar Generation (Gemini 2.0 Flash Image Gen)**
```
Prompt: "Create a futuristic holographic AI avatar portrait of this person. 
Style: Glowing amber/gold neon edge lines tracing facial features, 
semi-translucent face with visible grid/wireframe underlayer, 
deep black background, subtle particle effects, 
the person should be recognizable but clearly stylized as an AI. 
Clean composition, centered face, suitable as a profile picture."
```
- Generate 1 high-quality front-facing avatar from uploaded photo
- Store as base64 or upload to storage

**Step 2: Pseudo-3D Effect (CSS 3D Transforms)**
- Apply CSS perspective + mouse-tracking parallax for depth illusion
- Layer the avatar image with:
  - Background: Dark gradient with floating particles (canvas)  
  - Mid: The avatar image
  - Front: Holographic scan lines + glow overlay (CSS)
- Mouse movement shifts layers at different speeds → parallax depth
- On mobile: use device orientation (gyroscope) for same effect

**Step 3: Lip Sync (4-State Mouth System)**
For hackathon, keep it simple:
- **Closed** — default idle state
- **Slightly open** — low audio level
- **Open** — medium audio level  
- **Wide** — high audio level

Implementation:
- Overlay a semi-transparent mouth region on the avatar
- Use audio amplitude analysis (already have `AnalyserNode` in VoiceTrainer)
- Map amplitude → 4 CSS states with smooth transitions
- The holographic style makes simple mouth animations look intentional

**Step 4: Shareable Output**
- "Share Your Elit" button → generates a static image (canvas → PNG)
- Animated version: export as GIF/WebM using canvas recording
- Include "Verified on Solana" watermark for branding
- Perfect dimensions for X PFP (400x400) and header (1500x500)

#### What's Feasible in 3 Days
| Feature | Effort | Priority |
|---------|--------|----------|
| Gemini stylized avatar generation | 2h | P0 |
| CSS parallax 3D effect | 3h | P0 |
| Holographic overlay animations | 2h | P1 |
| Lip sync (amplitude-based) | 3h | P1 |
| Share as PNG for X PFP | 1h | P1 |
| Share as animated GIF | 3h | P2 |
| Turntable rotation (multi-angle) | 8h+ | POST-HACKATHON |

**Post-Hackathon Upgrades:**
- Multi-angle generation (8-16 views) for real 3D rotation
- Three.js mesh from depth estimation
- Proper viseme-based lip sync with phoneme mapping
- Real-time face tracking for expression mirroring

---

## 4. Timeline — 3-Day Sprint

### Day 1 (Feb 9 — TODAY): Core Polish + On-Chain
**Morning (4h):**
- [ ] Deploy Anchor program to devnet
- [ ] Add `@coral-xyz/anchor` to frontend
- [ ] Wire up `create_elit` transaction in Create flow
- [ ] Wire up `verify_elit` in Verify page (read from chain)

**Afternoon (4h):**
- [ ] Enhance avatar generation prompt for consistent "holographic neural" style
- [ ] Add CSS parallax 3D effect to Avatar3D component
- [ ] Create og-image.png (can use Gemini to generate)
- [ ] Test voice training end-to-end

### Day 2 (Feb 10): Avatar + Actions + Polish
**Morning (4h):**
- [ ] Lip sync overlay system (amplitude → mouth states)
- [ ] "Share Your Elit" → download as PNG
- [ ] Holographic scan line animations
- [ ] Fix low contrast text throughout

**Afternoon (4h):**
- [ ] Action execution UI polish (show results beautifully)
- [ ] Wire up `delegate` and `revoke` transactions
- [ ] Mobile responsiveness testing + fixes
- [ ] Error states and loading states throughout

### Day 3 (Feb 11): Demo + Ship
**Morning (4h):**
- [ ] Record demo video (3 min)
  - Create Elit + voice training
  - Avatar generation + 3D effect
  - On-chain verification
  - Turing test
- [ ] Final bug fixes from video recording

**Afternoon (4h):**
- [ ] Deploy final build to Vercel
- [ ] Write Colosseum forum post
- [ ] Submit to hackathon
- [ ] Share on X

---

## 5. Hackathon Winning Strategy

### The 30-Second Pitch
> "What if you could clone yourself — and prove it's authorized on Solana? Elits AI lets you train an AI version of yourself by just talking to it. It learns your knowledge, skills, and personality. Then it acts on your behalf: posts tweets in your voice, writes code in your style, responds to messages as you would. Every action is delegated and verifiable on-chain. Anyone can check if an Elit is the real deal with one click."

### Demo Flow (3 min video)
1. **0:00-0:30** — Connect wallet, create Elit (fill name, upload photo)
2. **0:30-1:00** — Watch AI generate holographic 3D avatar (wow moment)
3. **1:00-1:30** — Voice training call ("Hey, I'm Hamza, I build AI products...")
4. **1:30-2:00** — Elit writes a tweet in your voice + generates code
5. **2:00-2:30** — Turing test: can you tell which is the AI?
6. **2:30-3:00** — On-chain verification + revocation. "Your AI, your rules."

### What Makes It Win
1. **Universal appeal** — Every judge imagines their own Elit
2. **Visual wow factor** — Holographic 3D avatar with lip sync
3. **Real Solana usage** — Not just a token. Registry, delegation, verification.
4. **Voice training** — Using Gemini Live (cutting edge)
5. **Turing test** — Interactive, fun, proves the concept works
6. **Unique concept** — No one else in 482 projects is building verifiable AI clones

### Key Differentiators from Generic "AI Agent" Projects
- It's not just another chatbot wrapper
- The identity IS the blockchain integration
- Delegation model is novel (scoped, time-limited, revocable)
- Personality hash = verifiable AI fingerprint

---

## 6. Bugs Fixed

| Bug | Fix | Status |
|-----|-----|--------|
| Program ID placeholder in solana.ts | Updated to actual deployed ID `5RPvU...` | ✅ Fixed |
| Missing og-image.png | Need to generate | 🔲 TODO |
| Anchor not deployed to devnet | Need `anchor deploy --provider.cluster devnet` | 🔲 TODO |
| No on-chain transactions in frontend | Need `@coral-xyz/anchor` client | 🔲 TODO |

---

*This plan prioritizes hackathon impact. Every decision optimizes for "will this make the demo more impressive?"*
