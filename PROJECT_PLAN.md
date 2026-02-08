# ELITS AI — Project Plan
*"Your AI clone, verified on Solana. Teach it by voice. Let it act for you."*

## Vision
Elits AI lets anyone create a verifiable AI clone of themselves on Solana. Train it by talking to it (Gemini Live) or chatting. It learns your knowledge, skills, personality, interests — then acts on your behalf: posts on X, writes code, responds to messages, makes decisions. Your profile pic becomes a 3D animated avatar. Anyone can verify your Elit is really authorized by YOU via on-chain proof.

## Core Features

### 🎙️ Voice Training (Gemini Live)
- Call your Elit like a phone call using Gemini Live API
- Have natural conversations: "I'm a software engineer, I specialize in..."
- Elit extracts and stores: skills, knowledge, preferences, personality traits
- Progressive learning — each call makes it smarter about you
- Voice style analysis — learns your tone, vocabulary, speech patterns

### 💬 Chat Training
- Text-based alternative for training
- Upload documents, tweets, blog posts, code repos
- Paste conversations, emails, writing samples
- Structured intake: "What are your top skills?" "How do you make decisions?"
- Import from X/LinkedIn/GitHub profiles

### 🧠 Knowledge Model
- Skills inventory (coding languages, domains, expertise levels)
- Personality traits (communication style, values, humor)
- Decision-making patterns (risk tolerance, priorities)
- Interests & opinions (topics you care about, stances)
- Knowledge base (facts, experiences, relationships)
- All hashed → personality fingerprint stored on Solana

### 🎭 3D Avatar
- Upload profile pic → Gemini generates 3D animated avatar
- Unique visual identity for your Elit
- Animated expressions during conversations (thinking, speaking, idle)
- Avatar stored as on-chain metadata (image URI)
- Could evolve: more training = more detailed avatar

### ⚡ Action Execution (Act On Your Behalf)
- **X/Twitter**: Post tweets, reply, engage — in your voice
- **Coding**: Write code in your style, review PRs, debug
- **Messages**: Respond to DMs, emails, chats
- **Social Media**: LinkedIn posts, content creation
- **Research**: Search, summarize, analyze — report back
- **Custom Skills**: Any skill you teach it becomes an action
- All actions logged on-chain with delegation proof

### 🔐 Solana Verification Layer
- **Elit Registry**: PDA mapping wallet → Elit identity + personality hash
- **Delegation Tokens**: Scoped permissions (chat only, post only, full autonomy)
- **Verification**: Anyone calls `verify_elit(id)` → confirms authorization
- **Interaction Log**: State-compressed activity history
- **Revocation**: One tx to kill your Elit instantly

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      ELITS AI                             │
├──────────────┬───────────────┬───────────────────────────┤
│  TRAIN       │  VERIFY       │  ACT                      │
│              │               │                           │
│ 🎙️ Gemini    │ 🔗 Solana     │ 🐦 X/Twitter              │
│   Live Voice │   Registry    │ 💻 Code Generation         │
│ 💬 Chat      │   Delegation  │ 📧 Messages/Email          │
│ 📄 Doc Upload│   Verification│ 📱 Social Media            │
│ 🔗 Profile   │   Revocation  │ 🔍 Research                │
│   Import     │   Audit Log   │ 🎯 Custom Skills           │
├──────────────┴───────────────┴───────────────────────────┤
│                    PERSONALITY ENGINE                      │
│  Knowledge Graph · Trait Model · Style Fingerprint        │
│  Decision Patterns · Skill Inventory · Memory             │
├──────────────────────────────────────────────────────────┤
│                    3D AVATAR ENGINE                        │
│  Profile Pic → Gemini Image → Animated 3D · Expressions  │
├──────────────────────────────────────────────────────────┤
│                    SOLANA LAYER                            │
│  Anchor Program · State Compression · Wallet Connect      │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind, Framer Motion |
| Voice | Gemini Live API (`gemini-2.5-flash-native-audio-latest`) |
| AI/LLM | Gemini 2.5 Flash (personality engine, chat, avatar gen) |
| 3D Avatar | Gemini image generation → Three.js animated display |
| Blockchain | Anchor (Rust), Solana, State Compression |
| Wallet | Phantom / Solflare via @solana/wallet-adapter |
| Storage | Solana (hashes, registry), Vercel KV or Firebase (personality data) |
| Deployment | Vercel (frontend), Solana devnet→mainnet |

---

## Phases

### Phase 1: Foundation (Night 1 — Feb 8-9)
**Goal: Skeleton app + Anchor program + basic training**

**Anchor Program (Solana)**
- [ ] Elit Registry PDA (owner, personality_hash, avatar_uri, created_at, status)
- [ ] Delegation account (elit_id, scope, expires_at, restrictions)
- [ ] `create_elit` instruction
- [ ] `verify_elit` instruction
- [ ] `delegate` instruction
- [ ] `revoke_elit` instruction
- [ ] Deploy to devnet

**Next.js App**
- [ ] Project setup (Next.js 15 + Tailwind + wallet adapter)
- [ ] Landing page (hero, features, CTA)
- [ ] Design system (dark mode, glassmorphic, animated)
- [ ] Wallet connect flow
- [ ] Create Elit page (basic form: name, bio, skills)
- [ ] Layout + navigation

**Personality Engine v1**
- [ ] Structured intake form (skills, interests, values, communication style)
- [ ] Chat-based training interface
- [ ] Basic personality model (system prompt generation from training data)
- [ ] Personality hash generation (SHA256 of model)

**Deliverable:** App boots, wallet connects, can create an Elit on devnet, basic chat training works.

---

### Phase 2: Voice + Avatar (Day 2 — Feb 9-10)
**Goal: Gemini Live voice training + 3D avatar generation**

**Voice Training (Gemini Live)**
- [ ] WebSocket connection to Gemini Live API
- [ ] Audio capture (browser MediaRecorder)
- [ ] Real-time voice conversation with Elit trainer
- [ ] Knowledge extraction from voice conversations
- [ ] Transcript storage + personality model updates
- [ ] "Call your Elit" button with phone-call UI

**3D Avatar**
- [ ] Profile pic upload
- [ ] Gemini image generation → stylized 3D-looking avatar
- [ ] Three.js canvas for animated avatar display
- [ ] Idle animation (subtle breathing/movement)
- [ ] Speaking animation (mouth movement during voice)
- [ ] Thinking animation (processing state)
- [ ] Avatar stored as on-chain metadata URI

**Enhanced Personality Engine**
- [ ] Multi-session memory (remembers across training calls)
- [ ] Skill extraction from conversations
- [ ] Personality trait scoring (Big 5 or custom)
- [ ] Knowledge graph building (topics → expertise level)
- [ ] Writing style analysis (formal/casual, vocabulary, humor)

**Deliverable:** Can voice-call your Elit to train it. Avatar generated and animated. Personality deepens with each session.

---

### Phase 3: Actions + Verification (Day 3 — Feb 10-11)
**Goal: Elit acts on your behalf + full verification flow**

**Action Framework**
- [ ] Action types: post_tweet, write_code, respond_message, research
- [ ] Delegation check before every action (on-chain verification)
- [ ] Action queue with approval mode (auto or manual)
- [ ] X/Twitter integration (post in your voice/style)
- [ ] Code generation (write code matching your patterns)
- [ ] Message drafting (respond as you would)

**Verification System**
- [ ] Public verification page: `elits.ai/verify/[elit_id]`
- [ ] Shows: owner wallet, creation date, scopes, trust score, activity
- [ ] Embeddable verification badge
- [ ] "Talk to this Elit" button (verified chat)
- [ ] Interaction log viewer (all actions on-chain)

**Chat With Any Elit**
- [ ] Public chat interface: `elits.ai/chat/[username]`
- [ ] Verified badge on chat (✅ On-chain verified)
- [ ] Personality-driven responses
- [ ] Knowledge-aware answers
- [ ] "This isn't me" dispute button for real owner

**Delegation Dashboard**
- [ ] Manage scopes (what can your Elit do?)
- [ ] Time-based permissions (expires in 24h)
- [ ] Activity monitor (what has it done?)
- [ ] Emergency revoke button

**Deliverable:** Elits take real actions. Anyone can verify + chat with an Elit. Full delegation management.

---

### Phase 4: Polish + Demo + Ship (Day 4 — Feb 11-12)
**Goal: Production-ready, demo video, submit**

**Polish**
- [ ] Landing page animations (Framer Motion)
- [ ] Turing test mode (blind comparison: real vs Elit)
- [ ] Mobile responsive
- [ ] Error handling + loading states
- [ ] SEO + Open Graph tags
- [ ] Performance optimization

**Demo Video (≤3 min)**
- [ ] Minute 1: Create Elit + voice training call
- [ ] Minute 2: Elit takes action (posts tweet, writes code) + 3D avatar
- [ ] Minute 3: Verification on-chain + Turing test + revocation
- [ ] Screen recording + voiceover

**Deployment**
- [ ] Anchor program → Solana mainnet
- [ ] Next.js → Vercel
- [ ] Custom domain: elits.ai (if available)
- [ ] GitHub repo (public)

**Hackathon Submission**
- [ ] Register agent at Colosseum
- [ ] Forum post with description + screenshots
- [ ] Submit project
- [ ] Share on X (@hamzadiazbtc)

**Deliverable:** Live on mainnet. Demo video recorded. Submitted to Colosseum.

---

## Scoring Breakdown

| Criteria | Score | Why |
|----------|-------|-----|
| Uniqueness | 10/10 | Nobody in 482 projects is building verifiable AI clones |
| Judge Appeal | 10/10 | Every judge imagines THEIR Elit. Universal desire. |
| Solana Usage | 9/10 | Verification, delegation, revocation — couldn't exist without blockchain |
| Demo Impact | 10/10 | Live Turing test + voice training + 3D avatar = jaw drop |
| Buildability | 7/10 | Ambitious but each phase has clear deliverables |
| "Most Agentic" | 10/10 | An agent that IS you. Peak agentic. |
| **TOTAL** | **9.3/10** | |

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Voice quality | Gemini Live is production-grade. Hamza already used it for PathFinder. |
| Avatar generation | Use Gemini image gen. Fallback: stylized 2D with CSS animations. |
| Personality fidelity | Start with prompt engineering. Good enough for demo. Fine-tuning is post-hackathon. |
| Time (3.5 days) | Phase 1-2 are MVP. Phase 3-4 are differentiators. Even Phase 1-2 alone is competitive. |
| Solana program | Keep it simple. Registry + delegation + verify. No complex DeFi logic. |

---

## File Structure (Planned)

```
projects/elits-ai/
├── PROJECT_PLAN.md          ← this file
├── anchor/
│   ├── Anchor.toml
│   ├── programs/elits/
│   │   └── src/lib.rs       ← on-chain program
│   └── tests/
├── app/
│   ├── next.config.ts
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           ← landing
│   │   │   ├── create/page.tsx    ← create elit
│   │   │   ├── train/page.tsx     ← voice + chat training
│   │   │   ├── chat/[id]/page.tsx ← talk to an elit
│   │   │   ├── verify/[id]/page.tsx ← verification
│   │   │   ├── dashboard/page.tsx ← manage your elit
│   │   │   └── api/
│   │   │       ├── train/route.ts
│   │   │       ├── chat/route.ts
│   │   │       ├── actions/route.ts
│   │   │       └── avatar/route.ts
│   │   ├── components/
│   │   │   ├── Avatar3D.tsx
│   │   │   ├── VoiceTrainer.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── VerificationBadge.tsx
│   │   │   ├── DelegationManager.tsx
│   │   │   └── TuringTest.tsx
│   │   ├── lib/
│   │   │   ├── personality.ts
│   │   │   ├── solana.ts
│   │   │   └── gemini.ts
│   │   └── styles/
│   └── public/
└── README.md
```
