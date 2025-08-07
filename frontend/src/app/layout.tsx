import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'AI Chatbot - Next Generation Chat Experience',
  description: 'A modern AI chatbot with real-time streaming, beautiful UI, and intelligent responses powered by Gemini API.',
  keywords: 'AI chatbot, real-time chat, streaming, Gemini API, Next.js, React',
  authors: [{ name: 'AI Chatbot Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'AI Chatbot - Next Generation Chat Experience',
    description: 'A modern AI chatbot with real-time streaming and beautiful UI',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chatbot - Next Generation Chat Experience',
    description: 'A modern AI chatbot with real-time streaming and beautiful UI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 