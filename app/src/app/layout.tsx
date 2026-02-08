import type { Metadata } from 'next'
import './globals.css'
import { WalletProviderWrapper } from '@/components/WalletProvider'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Elits AI — Your AI Clone, Verified on Solana',
  description: 'Create a verifiable AI clone of yourself on Solana. Train it by voice. Let it act for you.',
  openGraph: {
    title: 'Elits AI — Your AI Clone, Verified on Solana',
    description: 'Create a verifiable AI clone of yourself on Solana. Train it by voice. Let it act for you.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface min-h-screen bg-grid antialiased">
        <WalletProviderWrapper>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </WalletProviderWrapper>
      </body>
    </html>
  )
}
