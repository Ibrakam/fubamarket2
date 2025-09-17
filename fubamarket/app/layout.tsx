import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { AuthProvider } from "@/contexts/auth-context"
import SiteHeader from "@/components/site-header"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "fuba market - Modern e-commerce marketplace",
  description: "Modern e-commerce vendor marketplace",
  generator: "v0.app",
  icons: {
    icon: '/1-100.jpg',
    shortcut: '/1-100.jpg',
    apple: '/1-100.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SiteHeader />
              {children}
              <Toaster position="top-right" richColors />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
