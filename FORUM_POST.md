# Elits AI — Your Verifiable AI Clone on Solana

## What if you could clone yourself?

Elits AI lets you create a **verifiable AI version of yourself** on Solana. Train it by having natural voice conversations — it learns your knowledge, expertise, personality, and communication style. Then it acts on your behalf: posts tweets in your voice, writes code in your style, responds to messages as you would. And here's what makes it different from every other AI agent: **anyone can cryptographically verify** that your clone is authorized by YOU, on-chain.

## Key Features

- 🎙️ **Voice Training via Gemini Live** — Have real-time voice conversations to teach your AI clone who you are. It extracts skills, personality traits, and communication patterns.
- 🎭 **3D AI Avatar** — Upload a photo, get an animated 3D avatar with idle, speaking, and thinking states. Your visual identity on Solana.
- ⚡ **Action Execution** — Your Elit posts tweets, writes code, responds to messages, and conducts research — all in your authentic style.
- 🔐 **On-Chain Verification** — Personality hash stored on Solana. Anyone calls `verify_elit()` to confirm authorization. One transaction to revoke.
- 🎯 **Scoped Delegation** — Time-limited, scope-restricted permissions. Give your clone access to post but not code. Expires in 7 days. You decide.
- 🧪 **Turing Test** — Blind comparison between real human responses and Elit responses. Can judges tell the difference?
- 🛑 **Emergency Kill Switch** — Revoke ALL delegations and disable your Elit instantly. Your clone, your rules.

## Technical Architecture

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS 4, Framer Motion — glassmorphic dark design
- **AI Engine:** Gemini 2.5 Flash for personality modeling, Gemini Live for voice training, Gemini image gen for avatars
- **Blockchain:** Anchor program on Solana Devnet — Elit Registry PDA, Delegation accounts, verification and revocation
- **Wallet:** Phantom/Solflare via @solana/wallet-adapter

The personality engine builds a model from voice conversations and chat: skills inventory, trait scoring, communication style analysis, knowledge graph. This model generates a SHA-256 hash stored on-chain as the Elit's identity fingerprint.

## Why It Matters

Today's AI agents act autonomously but have **zero accountability**. There's no way to verify who authorized an AI to act, what permissions it has, or whether it's actually representing who it claims to.

Elits AI solves this by putting the **verification layer on Solana**:
- Every Elit has a cryptographic identity tied to a wallet
- Delegations are scoped and time-bound
- Anyone can verify authorization on-chain
- The owner can revoke instantly

This is the infrastructure for **trustworthy AI agents** — agents that can prove they're authorized to act on behalf of real people.

## Links

- 🌐 **Live Demo:** [elits-ai.vercel.app](https://elits-ai.vercel.app)
- 💻 **GitHub:** [github.com/hamzadiaz/elits-ai](https://github.com/hamzadiaz/elits-ai)
- ⛓️ **Solana Program:** [`5RPvUJ1pAQpeADq4QDX179etC3SUmk6q1TFdMYYqGNPF`](https://explorer.solana.com/address/5RPvUJ1pAQpeADq4QDX179etC3SUmk6q1TFdMYYqGNPF?cluster=devnet) (Devnet)

## Demo Walkthrough

1. **Connect wallet** → Create your Elit with name, bio, skills, and values
2. **Upload a photo** → AI generates a stylized 3D avatar with animations
3. **Voice train** → Have a live voice conversation with Gemini to teach your clone
4. **Execute actions** → Your Elit posts tweets and writes code in your style
5. **Verify on-chain** → Anyone can confirm your Elit's authorization on Solana
6. **Turing Test** → Blind comparison: can you tell AI from human?
7. **Kill switch** → Revoke everything with one click

Built solo by [@hamzadiazbtc](https://x.com/hamzadiazbtc) for the Colosseum Agent Hackathon.
