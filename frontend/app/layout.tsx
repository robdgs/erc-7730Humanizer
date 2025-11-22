import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ERC-7730 Transaction Decoder',
  description: 'Human-readable transaction signing with ERC-7730 descriptors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
