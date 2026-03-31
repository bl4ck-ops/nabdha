function getBatteryColor(level) {
  if (level >= 70) return { bar: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  if (level >= 40) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
  return { bar: 'bg-rose-400', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
}

function getBatteryEmoji(level) {
  if (level >= 75) return '🌟'
  if (level >= 50) return '😊'
  if (level >= 30) return '😐'
  return '🪫'
}

/**
 * BatteryBar — displays a user's نبضة level
 * @param {string} name - display name
 * @param {number} level - battery level 0–100
 * @param {boolean} isMe - if true renders a slightly different style
 * @param {string} updatedAt - timestamp label
 */
export default function BatteryBar({ name, level, isMe = false, updatedAt }) {
  const colors = getBatteryColor(level ?? 0)
  const hasData = level !== null && level !== undefined

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 w-full`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{hasData ? getBatteryEmoji(level) : '❓'}</span>
          <div>
            <p className={`font-bold text-base leading-tight ${isMe ? 'text-gray-800' : 'text-gray-700'}`}>
              {name}
            </p>
            {isMe && <p className="text-xs text-gray-400">أنا</p>}
          </div>
        </div>
        <span className={`text-2xl font-bold ${colors.text}`}>
          {hasData ? `${level}%` : '—'}
        </span>
      </div>

      {/* Battery bar */}
      <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: hasData ? `${level}%` : '0%' }}
        />
      </div>

      {updatedAt && (
        <p className="text-xs text-gray-400 mt-2">
          آخر تحديث: {updatedAt}
        </p>
      )}
      {!hasData && (
        <p className="text-xs text-gray-400 mt-2">لسه ما عملش تشيك-إن</p>
      )}
    </div>
  )
}
