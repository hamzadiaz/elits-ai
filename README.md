# ⚡ Elits AI

**Your verifiable AI clone on Solana. Teach it by voice. Let it act for you.**

> 🏆 Built for the [Colosseum Agent Hackathon](https://www.colosseum.org/)

[![Live Demo](https://img.shields.io/badge/Live-elits--ai.vercel.app-7c3aed?style=for-the-badge)](https://elits-ai.vercel.app)
[![Solana](https://img.shields.io/badge/Solana-Devnet-00d18c?style=for-the-badge)](https://explorer.solana.com/address/5RPvUJ1pAQpeADq4QDX179etC3SUmk6q1TFdMYYqGNPF?cluster=devnet)

---

## What is Elits AI?

Elits AI lets anyone create a **verifiable AI clone** of themselves on Solana. Train it by having natural voice conversations (powered by Gemini Live) or chatting. It learns your knowledge, skills, personality, and communication style — then acts on your behalf: posts on X, writes code, responds to messages, and makes decisions.

Your clone is verified **on-chain** — anyone can cryptographically confirm your Elit is authorized by you, and you can revoke it with a single transaction.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎙️ **Voice Training** | Train your AI clone through natural voice conversations via Gemini Live |
| 🎭 **3D AI Avatar** | Upload a photo → AI generates an animated 3D avatar with expressions |
| ⚡ **Actions** | Your Elit posts tweets, writes code, responds to messages in your style |
| 🔐 **On-Chain Verification** | Personality hash on Solana — cryptographic proof of authorization |
| 🧪 **Turing Test** | Blind comparison between you and your clone — can people tell? |
| 🎯 **Delegation System** | Scoped, time-limited permissions with emergency kill switch |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       ELITS AI                            │
├──────────────┬───────────────┬───────────────────────────┤
│  TRAIN       │  VERIFY       │  ACT                      │
│  🎙️ Voice    │  🔗 Registry   │  🐦 Post Tweets           │
│  💬 Chat     │  📋 Delegation │  💻 Write Code             │
│  📄 Upload   │  ✅ Verify     │  📧 Respond                │
│  🖼️ Avatar   │  🛑 Revoke     │  🔍 Research               │
├──────────────┴───────────────┴───────────────────────────┤
│              PERSONALITY ENGINE (Gemini AI)                │
│  Knowledge Graph · Trait Model · Style Fingerprint        │
├──────────────────────────────────────────────────────────┤
│              3D AVATAR ENGINE (Three.js)                  │
│  Photo → AI Generation → Animated Display                │
├──────────────────────────────────────────────────────────┤
│              SOLANA LAYER (Anchor)                        │
│  Elit Registry · Delegation PDAs · State Compression     │
└──────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS 4, Framer Motion |
| Voice | Gemini Live API (native audio streaming) |
| AI/LLM | Gemini 2.5 Flash (personality engine, chat, avatar gen) |
| 3D Avatar | Gemini image generation + Three.js animated display |
| Blockchain | Anchor (Rust), Solana Devnet |
| Wallet | Phantom / Solflare via @solana/wallet-adapter |
| Deployment | Vercel |

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/hamzadiaz/elits-ai.git
cd elits-ai/app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features |
| `NEXT_PUBLIC_SOLANA_RPC` | Solana RPC endpoint (defaults to devnet) |

## ⛓️ Solana Program

- **Program ID:** `5RPvUJ1pAQpeADq4QDX179etC3SUmk6q1TFdMYYqGNPF`
- **Network:** Devnet
- **Framework:** Anchor

### Instructions

| Instruction | Description |
|-------------|-------------|
| `create_elit` | Register a new Elit with personality hash |
| `verify_elit` | Verify an Elit's authorization on-chain |
| `delegate` | Create scoped, time-limited delegation |
| `revoke_elit` | Emergency kill switch — revoke everything |

## 📸 Screenshots

| Landing | Create | Voice Training |
|---------|--------|---------------|
| Dark glassmorphic design with animated hero | 4-step wizard with 3D avatar generation | Real-time voice conversation with Gemini Live |

| Dashboard | Turing Test | Verification |
|-----------|-------------|-------------|
| Actions, delegations, kill switch | Blind AI vs Human comparison | On-chain proof of authorization |

## 👤 Team

Built by **Hamza Diaz** ([@hamzadiazbtc](https://x.com/hamzadiazbtc))

## 📄 License

MIT
