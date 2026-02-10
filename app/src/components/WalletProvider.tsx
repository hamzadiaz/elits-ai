'use client'

import { useMemo, ReactNode, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const wallets = useMemo(() => {
    if (!mounted) return []
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  // Always render providers so useWallet() works, but wallets array empty until mounted
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={mounted}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
