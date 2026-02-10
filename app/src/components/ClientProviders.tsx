'use client'

import { ReactNode } from 'react'
import { WalletProviderWrapper } from '@/components/WalletProvider'
import { ToastProvider } from '@/components/Toast'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProviderWrapper>
      <ToastProvider>
        {children}
      </ToastProvider>
    </WalletProviderWrapper>
  )
}
