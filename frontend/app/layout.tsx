import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import Navbar from "@/components/navbar"
import { AuthProvider } from "@/context/auth-context"
import { CountryProvider } from "@/context/country-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CountryProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <footer className="py-6 border-t">
                  <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} TravelTales. All rights reserved.
                  </div>
                </footer>
              </div>
              <Toaster />
            </CountryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      title: "TravelTales",
    };
