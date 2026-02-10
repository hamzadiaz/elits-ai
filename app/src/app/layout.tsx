import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { ClientProviders } from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'Elits — Non-Fungible Agents on Solana',
  description: 'The first Non-Fungible Agents (NFAs) on Solana. Own, trade, and earn from unique AI agents. NFTs were just pictures — NFAs are AI you own, use, and earn from.',
  keywords: ['NFA', 'Non-Fungible Agents', 'AI agent', 'Solana', 'NFT', 'AI NFT', 'voice training', 'Gemini', 'agent marketplace', 'yield-bearing NFT'],
  authors: [{ name: 'Elits' }],
  openGraph: {
    title: 'Elits — Non-Fungible Agents on Solana',
    description: 'NFTs were just pictures. NFAs are AI agents you own, use, and earn from. The first yield-bearing agents on Solana.',
    url: 'https://elits-ai.vercel.app',
    siteName: 'Elits',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Elits — Non-Fungible Agents on Solana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elits — Non-Fungible Agents on Solana',
    description: 'NFTs were just pictures. NFAs are AI agents you own, use, and earn from.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL('https://elits-ai.vercel.app'),
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
          <ToastProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </ToastProvider>
        </WalletProviderWrapper>
      </body>
    </html>
  )
}
