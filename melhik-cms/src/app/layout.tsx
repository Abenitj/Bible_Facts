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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const darkMode = localStorage.getItem('darkMode');
                  if (darkMode === 'true') {
                    document.documentElement.classList.add('dark');
                    document.body.style.backgroundColor = '#111827';
                  } else {
                    document.body.style.backgroundColor = '#f9fafb';
                  }
                } catch (e) {
                  // Fallback to light mode if localStorage is not available
                  document.body.style.backgroundColor = '#f9fafb';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <DarkModeProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </DarkModeProvider>
      </body>
    </html>
  )
}
