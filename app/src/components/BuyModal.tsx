'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, ExternalLink, Wallet, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { type NFAAgent, buyAgent, AVATAR_STYLES, RARITY_CONFIG } from '@/lib/agents'
import { getConnection, getProvider, getProgram, createElitOnChain } from '@/lib/solana'

const TREASURY = new PublicKey('HzDYrbRCPjQVk5yBXTvHqSLNZnKkqjvF9X4N8xTo4Kej')
const DEVNET_RPC = 'https://api.devnet.solana.com'

interface BuyModalProps {
  agent: NFAAgent
  onClose: () => void
  onSuccess: (sig: string) => void
}

export function BuyModal({ agent, onClose, onSuccess }: BuyModalProps) {
  const { publicKey, sendTransaction, signTransaction, signAllTransactions, connected } = useWallet()
  const [status, setStatus] = useState<'confirm' | 'sending' | 'success' | 'error'>('confirm')
  const [txSig, setTxSig] = useState('')
  const [error, setError] = useState('')
  const [chainWarning, setChainWarning] = useState('')

  const style = AVATAR_STYLES[agent.avatarStyle]
  const rarity = RARITY_CONFIG[agent.rarity]

  const handleBuy = async () => {
    if (!publicKey || !sendTransaction) return

    setStatus('sending')
    try {
      const connection = new Connection(DEVNET_RPC, 'confirmed')
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY,
          lamports: Math.round(agent.price * LAMPORTS_PER_SOL),
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const sig = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(sig, 'confirmed')

      // Mark as owned in localStorage
      buyAgent(agent.id)
      setTxSig(sig)

      // Try to create Elit on-chain (1 per wallet limitation — v1)
      if (signTransaction && signAllTransactions) {
        try {
          const connection = getConnection()
          const provider = getProvider(connection, { publicKey, signTransaction, signAllTransactions } as never)
          const program = getProgram(provider)
          // Simple hash of personality text
          let hash = 0
          for (let i = 0; i < agent.personality.length; i++) {
            hash = ((hash << 5) - hash + agent.personality.charCodeAt(i)) | 0
          }
          const personalityHash = Math.abs(hash).toString(16).padStart(16, '0')
          await createElitOnChain(
            program, publicKey, agent.name,
            agent.description.slice(0, 200),
            personalityHash.slice(0, 64),
            agent.avatarStyle
          )
        } catch (chainErr) {
          console.warn('On-chain create_elit failed (may already have one per wallet — v1 limitation):', chainErr)
          setChainWarning('On-chain registration skipped (1 Elit per wallet in v1). Purchase still valid.')
        }
      }

      setStatus('success')
      onSuccess(sig)
    } catch (err) {
      console.error('Buy error:', err)
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setStatus('error')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-[#0a0a0a] border border-white/[0.08] overflow-hidden"
        >
          {/* Header */}
          <div className={`h-16 ${style.bgPattern} flex items-center justify-between px-5`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center ${style.borderGlow}`}>
                <span className="text-lg font-bold text-white/80">{agent.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">{agent.name}</h3>
                <span className={`text-[10px] ${rarity.color}`}>{rarity.label}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-black/30 text-white/40 hover:text-white/70 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            {status === 'confirm' && (
              <div className="space-y-4">
                <p className="text-[12px] text-white/40 leading-relaxed">{agent.description}</p>

                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/30">Price</span>
                    <span className="text-white/70 font-semibold">{agent.price} SOL</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/30">Per-use fee</span>
                    <span className="text-white/50">{agent.perUseFee} SOL/msg</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/30">Network</span>
                    <span className="text-amber-300/60">Solana Devnet</span>
                  </div>
                </div>

                {!connected ? (
                  <div className="text-center py-3">
                    <Wallet className="w-8 h-8 text-amber-400/30 mx-auto mb-2" />
                    <p className="text-[12px] text-white/40 mb-3">Connect your wallet to purchase</p>
                    <p className="text-[10px] text-white/20">Use the wallet button in the navigation bar</p>
                  </div>
                ) : (
                  <button onClick={handleBuy}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white/90 font-semibold text-[13px] btn-glow hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 opacity-60" />
                    Confirm Purchase — {agent.price} SOL
                  </button>
                )}
              </div>
            )}

            {status === 'sending' && (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 text-amber-400/50 mx-auto mb-4 animate-spin" />
                <p className="text-[13px] text-white/50">Confirming transaction...</p>
                <p className="text-[10px] text-white/25 mt-1">Please approve in your wallet</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-400/60 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white/80 mb-1">Purchase Complete! 🎉</h3>
                <p className="text-[12px] text-white/40 mb-4">You now own <strong className="text-white/60">{agent.name}</strong></p>

                {chainWarning && (
                  <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.1] p-3 mb-3">
                    <p className="text-[10px] text-amber-300/50">{chainWarning}</p>
                  </div>
                )}

                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 mb-4">
                  <p className="text-[9px] text-white/20 uppercase tracking-wider mb-1">Transaction</p>
                  <p className="text-[10px] text-amber-300/50 font-mono break-all">{txSig}</p>
                </div>

                <div className="flex gap-2 justify-center">
                  <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/[0.08] text-[11px] text-white/40 hover:text-white/60 transition-all">
                    <ExternalLink className="w-3 h-3" /> View on Explorer
                  </a>
                  <button onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/70 hover:bg-amber-500/15 transition-all cursor-pointer">
                    Start Chatting
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-6">
                <AlertTriangle className="w-10 h-10 text-red-400/50 mx-auto mb-3" />
                <h3 className="text-[14px] font-semibold text-white/70 mb-1">Transaction Failed</h3>
                <p className="text-[11px] text-white/30 mb-4 max-w-xs mx-auto">{error}</p>
                <button onClick={() => setStatus('confirm')}
                  className="px-5 py-2 rounded-lg border border-white/[0.08] text-[12px] text-white/40 hover:text-white/60 transition-all cursor-pointer">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
