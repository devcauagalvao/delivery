import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/hooks/use-cart'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taurus Black Burgers',
  description: 'Os melhores hambúrgueres da cidade com entrega rápida',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head />
      <body className={`${inter.className} bg-white`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              theme="dark"
              position="top-center"
              toastOptions={{
                style: {
                  background: '#cc9b3b',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontWeight: 'bold',
                },
                className: 'shadow-lg',
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}