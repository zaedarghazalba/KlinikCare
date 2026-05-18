"use client"

import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true)
      setTimeout(() => setVisible(false), 300)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0ea5e9" }}>
          <div
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "3px solid #0ea5e9",
              opacity: 0,
              animation: "pulseRing 1.5s ease-out infinite",
            }}
          />
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 48, height: 48, position: "relative", zIndex: 2 }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
          </svg>
        </div>
        <div style={{ width: 200, height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden", margin: "0 auto 16px" }}>
          <div
            style={{
              height: "100%",
              width: "0%",
              background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
              borderRadius: 2,
              animation: "loadingBar 1s ease-in-out forwards",
            }}
          />
        </div>
        <p style={{ fontFamily: "Lato, sans-serif", fontSize: 14, fontWeight: 500, color: "#64748b", letterSpacing: 0.5, margin: 0 }}>
          Memuat KlinikCare...
        </p>
      </div>
    </div>
  )
}
