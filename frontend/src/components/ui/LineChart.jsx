export default function LineChart({ points = [] }) {
  const width = 600
  const height = 160
  const padding = 24

  // Validate and filter points
  const validPoints = Array.isArray(points) ? points.filter(p => typeof p === 'number' && !isNaN(p)) : []
  
  // Return empty SVG if no valid points
  if (validPoints.length === 0) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="#9ca3af" fontSize="14">
          No data available
        </text>
      </svg>
    )
  }

  const xs = validPoints.map((_, i) => i)
  const ys = validPoints
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

  // Ensure path always starts with 'M' (moveto)
  const d = validPoints
    .map((v, i) => {
      const x = xScale(i)
      const y = yScale(v)
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  // Ensure fill path also starts correctly
  const fillPath = validPoints.length > 0 
    ? `${d} L ${xScale(xs.length - 1)} ${height - padding} L ${xScale(0)} ${height - padding} Z`
    : ''

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      <defs>
        <linearGradient id="lc" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {d && <path d={d} fill="none" stroke="#3b82f6" strokeWidth="2" />}
      {fillPath && <path d={fillPath} fill="url(#lc)" />}
    </svg>
  )
}


