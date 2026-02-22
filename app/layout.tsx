import type React from "react"
// ... existing code ...
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
// <CHANGE> Added SidebarProvider import
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// <CHANGE> Updated metadata for network monitoring app
export const metadata: Metadata = {
  title: "NetGuard IDS - Network Monitoring & Intrusion Detection",
  description:
    "Real-time network monitoring and intrusion detection system with live traffic statistics, alerts, and comprehensive event logging",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        {/* <CHANGE> Wrapped app in SidebarProvider with sidebar and header */}
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  )
}
