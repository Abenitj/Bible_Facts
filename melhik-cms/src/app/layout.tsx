import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { UserProvider } from '@/contexts/UserContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Melhik CMS',
  description: 'Content Management System for Melhik',
  // Remove favicon references to prevent 500 errors
  // icon: '/favicon.ico',
  // apple: '/favicon.ico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DarkModeProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
}
