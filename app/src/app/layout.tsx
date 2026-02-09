import type { Metadata } from 'next'
import './globals.css'
import { WalletProviderWrapper } from '@/components/WalletProvider'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Elits AI — Your AI Clone, Verified on Solana',
  description: 'Create a verifiable AI clone of yourself on Solana. Train it by voice with Gemini Live. Let it act on your behalf with on-chain delegation and verification.',
  keywords: ['AI clone', 'Solana', 'AI agent', 'voice training', 'Gemini', 'blockchain verification', 'digital twin'],
  authors: [{ name: 'Elits AI' }],
  openGraph: {
    title: 'Elits AI — Your AI Clone, Verified on Solana',
    description: 'Create a verifiable AI clone of yourself on Solana. Train it by voice. Let it act for you.',
    url: 'https://elits-ai.vercel.app',
    siteName: 'Elits AI',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Elits AI — Your Verifiable AI Clone on Solana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elits AI — Your AI Clone, Verified on Solana',
    description: 'Train it by voice. Let it act for you. Verified on-chain.',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
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
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </WalletProviderWrapper>
      </body>
    </html>
  )
}
