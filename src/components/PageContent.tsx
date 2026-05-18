"use client"

import { useEffect, useState, type ReactNode } from "react"

export default function PageContent({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ opacity: ready ? 1 : 0, transition: "opacity 0.3s ease" }}>
      {children}
    </div>
  )
}
