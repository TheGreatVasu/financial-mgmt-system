import { useMemo } from 'react'

export default function PieChart({ data = [], size = 220, strokeWidth = 22, animated = true }) {
  const total = useMemo(() => data.reduce((s, d) => s + (Number(d.value) || 0), 0), [data])
  const radius = useMemo(() => Math.max(10, (size - strokeWidth) / 2), [size, strokeWidth])
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius])

  let offset = 0

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
      <defs>
        <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#60a5fa" floodOpacity="0.45" />
        </filter>
      </defs>
      <g transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
        {/* Background ring */}
        <circle r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        {data.map((seg, i) => {
          const value = Number(seg.value) || 0
          const pct = total ? value / total : 0
          const dash = pct * circumference
          const dashArray = `${dash} ${circumference - dash}`
          const currentOffset = offset
          offset += dash
          const color = seg.color || ['#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8'][i % 5]

          return (
            <circle
              key={i}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={circumference - currentOffset}
              strokeLinecap="round"
              style={{
                filter: 'url(#blueGlow)',
                transition: animated ? 'stroke-dasharray 800ms ease, stroke 300ms ease' : 'none'
              }}
            />
          )
        })}
      </g>
    </svg>
  )
}


