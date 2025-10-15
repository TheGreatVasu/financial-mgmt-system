import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const startRef = useRef(Date.now())

  const messages = useMemo(() => ([
    'Fetching insights…',
    'Analyzing reports…',
    'Optimizing data streams…',
    'Calibrating KPIs…',
    'Finalizing security and preferences…',
  ]), [])

  useEffect(() => {
    const totalMs = 35000
    const tick = 120
    const timer = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, Math.round((elapsed / totalMs) * 100))
      setProgress(pct)
      const seg = Math.floor((elapsed / totalMs) * messages.length)
      setMsgIndex(Math.min(messages.length - 1, seg))
      if (elapsed >= totalMs) {
        clearInterval(timer)
        setFadeOut(true)
        setTimeout(() => navigate('/dashboard'), 700)
      }
    }, tick)
    return () => clearInterval(timer)
  }, [messages, navigate])

  return (
    <div className={`relative min-h-screen overflow-hidden ${fadeOut ? 'opacity-0 transition-opacity duration-700' : 'opacity-100 transition-opacity duration-700'}`}>
      {/* Animated gradient backdrop */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ background: 'radial-gradient(1200px 600px at 20% -10%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(800px 400px at 120% 10%, rgba(99,102,241,0.22), transparent 60%), linear-gradient(180deg,#0f172a 0%, #0a0f24 100%)' }}
      />
      <motion.div className="absolute -top-40 -left-20 h-[540px] w-[540px] rounded-full bg-blue-500/20 blur-3xl" animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -bottom-40 -right-20 h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-3xl" animate={{ y: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Particles */}
      <Particles />

      {/* Center card */}
      <div className="relative z-10 grid place-items-center min-h-screen p-6">
        <motion.div className="w-full max-w-3xl rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.45)] p-8 text-white" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-white/20">
              <span className="text-lg font-semibold">F</span>
            </div>
            <div className="text-lg font-semibold tracking-wide">Preparing your FinFlow Dashboard</div>
          </div>

          {/* Visualization: grid + waveform + floating icons */}
          <div className="mt-6 relative h-48 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 overflow-hidden border border-white/10">
            <GridLines />
            <div className="absolute inset-x-6 bottom-6">
              <Waveform />
            </div>
            <FloatingIcons />
          </div>

          {/* Dynamic message */}
          <div className="mt-6 h-6 text-base md:text-lg text-white/90">
            <AnimatePresence mode="wait">
              <motion.div key={msgIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
                {messages[msgIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="h-3 w-full rounded-full bg-white/15 overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-200 via-white to-blue-200" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: 'easeOut', duration: 0.2 }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white/70">
              <span>Initializing modules…</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Footer status */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm text-white/70">
            <StatusPill>Finalizing setup…</StatusPill>
            <StatusPill>Syncing preferences…</StatusPill>
            <StatusPill>Securing data…</StatusPill>
          </div>

          <div className="mt-6 text-xs md:text-sm text-white/70">
            This may take up to a few seconds — we’ll redirect you to your personalized dashboard as soon as it’s ready. <span className="text-white/80">Empowering smarter financial decisions every second.</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function GridLines() {
  return (
    <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full text-white/20">
      <defs>
        <pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#p)" />
    </svg>
  )
}

function Waveform() {
  return (
    <svg viewBox="0 0 400 40" className="w-full h-10 text-white/80">
      <path d="M0 20 C 40 0, 80 40, 120 20 S 200 0, 240 20 S 320 40, 360 20 S 400 0, 440 20" fill="none" stroke="currentColor" strokeWidth="2">
        <animate attributeName="d" dur="2200ms" repeatCount="indefinite"
          values="M0 20 C 40 0, 80 40, 120 20 S 200 0, 240 20 S 320 40, 360 20 S 400 0, 440 20;
                  M0 20 C 40 40, 80 0, 120 20 S 200 40, 240 20 S 320 0, 360 20 S 400 40, 440 20;
                  M0 20 C 40 0, 80 40, 120 20 S 200 0, 240 20 S 320 40, 360 20 S 400 0, 440 20" />
      </path>
    </svg>
  )
}

function FloatingIcons() {
  const items = [
    { x: '10%', delay: 0, label: '📊' },
    { x: '30%', delay: 0.6, label: '🧾' },
    { x: '55%', delay: 0.3, label: '👥' },
    { x: '80%', delay: 0.9, label: '🔐' },
  ]
  return (
    <div className="absolute inset-0">
      {items.map((it, i) => (
        <motion.div key={i} className="absolute bottom-10 text-lg md:text-xl" style={{ left: it.x }} animate={{ y: [0, -10, 0] }} transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: it.delay }}>
          {it.label}
        </motion.div>
      ))}
    </div>
  )
}

function Particles() {
  const dots = Array.from({ length: 30 }).map((_, i) => ({
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    delay: Math.random() * 5,
    size: 2 + Math.random() * 3,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d, i) => (
        <motion.span key={i} className="absolute rounded-full bg-white/30" style={{ left: d.left, top: d.top, width: d.size, height: d.size }} animate={{ opacity: [0.2, 0.7, 0.2], y: [-6, 6, -6] }} transition={{ duration: 5 + (i % 3), repeat: Infinity, delay: d.delay }} />
      ))}
    </div>
  )
}

function StatusPill({ children }) {
  return <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-center">{children}</div>
}


