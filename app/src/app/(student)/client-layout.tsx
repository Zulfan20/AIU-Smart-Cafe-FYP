"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // REMOVED <html> and <body>. 
    // We use a Fragment (<>...</>) or a simple <div> if styling is needed.
    <>
      <Suspense fallback={null}>{children}</Suspense>
      <Analytics />
    </>
  )
}

export default ClientLayout