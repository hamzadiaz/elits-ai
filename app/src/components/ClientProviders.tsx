'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { ToastProvider } from '@/components/Toast'

const WalletProviderWrapper = dynamic(
  () => import('@/components/WalletProvider').then(m => m.WalletProviderWrapper),
  { ssr: false }
)

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProviderWrapper>
      <ToastProvider>
        {children}
      </ToastProvider>
    </WalletProviderWrapper>
  )
}
