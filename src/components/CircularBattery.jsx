function getBatteryColors(level) {
  if (level >= 70) return { stroke: '#10b981', text: '#059669' } // green
  if (level >= 40) return { stroke: '#f59e0b', text: '#d97706' } // amber
  return { stroke: '#f43f5e', text: '#e11d48' }                  // red
}

function getBatteryEmoji(level) {
  if (level >= 75) return '⚡'
  if (level >= 55) return '🙂'
  if (level >= 35) return '😐'
  if (level >= 15) return '😔'
  return '🪫'
}

/**
 * CircularBattery — SVG radial progress ring showing battery level
 * @param {string}  name      - display name shown below the circle
 * @param {number}  level     - 0–100, or null/undefined for "no data"
 * @param {boolean} isMe      - adds "أنا" subtitle
 * @param {string}  updatedAt - formatted timestamp string
 * @param {'lg'|'sm'} size   - 'lg' = 106px ring (partner), 'sm' = 74px ring (self)
 */
export default function CircularBattery({ name, level, isMe = false, updatedAt, size = 'lg' }) {
  const hasData   = level !== null && level !== undefined
  const pct       = hasData ? Math.min(100, Math.max(0, level)) : 0
  const radius    = size === 'lg' ? 45 : 32
  const sw        = size === 'lg' ? 8 : 6
  const svgSize   = (radius + sw) * 2
  const circ      = 2 * Math.PI * radius
  const offset    = circ * (1 - pct / 100)
  const colors    = hasData ? getBatteryColors(pct) : { stroke: '#e5e7eb', text: '#9ca3af' }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Ring */}
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" stroke="#f3f4f6" strokeWidth={sw}
          />
          {/* Progress */}
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s ease-out' }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className={`font-bold leading-none ${size === 'lg' ? 'text-xl' : 'text-sm'}`}
            style={{ color: colors.text }}
          >
            {hasData ? `${pct}%` : '—'}
          </span>
          <span className={size === 'lg' ? 'text-base' : 'text-xs'}>
            {hasData ? getBatteryEmoji(pct) : '❓'}
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="text-center">
        <p className={`font-bold text-gray-800 leading-tight ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
          {name}
        </p>
        {isMe && <p className="text-xs text-gray-400">أنا</p>}
        {updatedAt  && <p className="text-xs text-gray-400 mt-0.5">آخر تحديث: {updatedAt}</p>}
        {!hasData   && <p className="text-xs text-gray-400 mt-0.5">لسه ما سجّلش</p>}
      </div>
    </div>
  )
}
