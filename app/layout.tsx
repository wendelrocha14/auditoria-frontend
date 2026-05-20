import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Audit Pro | Sistema de Auditoria Industrial',
  description: 'Sistema premium de auditoria de estoque industrial',
  generator: 'v0.app',
  manifest: '/manifest.json',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Audit Pro',
  },

  formatDetection: {
    telephone: false,
  },

  icons: {
    icon: '/menagement.png',
    shortcut: '/menagement.png',
    apple: '/menagement.png',
  },
}