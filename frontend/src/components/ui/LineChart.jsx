export default function LineChart({ points = [] }) {
  const width = 600
  const height = 160
  const padding = 24

  const xs = points.map((_, i) => i)
  const ys = points
  const maxY = Math.max(1, ...ys)
  const minY = Math.min(0, ...ys)

  function xScale(i) {
    if (xs.length <= 1) return padding
    return padding + (i * (width - padding * 2)) / (xs.length - 1)
  }
  function yScale(v) {
    const range = maxY - minY || 1
    return height - padding - ((v - minY) * (height - padding * 2)) / range
  }

  const d = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      <defs>
        <linearGradient id="lc" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d={`${d} L ${xScale(xs.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`} fill="url(#lc)" />
    </svg>
  )
}


