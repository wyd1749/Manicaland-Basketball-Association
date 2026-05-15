import type { Metadata, Viewport } from "next"
import { Oswald, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Manicaland Basketball Association",
  description:
    "Official website of the Manicaland Basketball Association (MBA) - Zimbabwe's premier provincial basketball league. Scores, standings, teams, players, and news.",
  icons: {
    icon: [
      {
        url: "/logo13.png",
        type: "image/png",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Manicaland Basketball Association",
    description: "Official website of the Manicaland Basketball Association (MBA) - Zimbabwe's premier provincial basketball league. Scores, standings, teams, players, and news.",
    url: "https://manicaland-basketball-association.vercel.app",
    siteName: "Manicaland Basketball Association",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Manicaland Basketball Association Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manicaland Basketball Association",
    description: "Official website of the Manicaland Basketball Association (MBA) - Zimbabwe's premier provincial basketball league.",
    images: ["/preview.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${inter.variable} font-serif antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}