import { LOVE_LANGUAGES } from '../data/suggestions'

const ACCENT_COLORS = {
  words:   { border: '#e11d48', bg: '#fff0f3' },
  time:    { border: '#7c3aed', bg: '#f5f3ff' },
  touch:   { border: '#0891b2', bg: '#ecfeff' },
  service: { border: '#059669', bg: '#ecfdf5' },
  gifts:   { border: '#d97706', bg: '#fffbeb' },
}

export default function LoveLangCard({ suggestion, loveLanguageKey }) {
  const lang   = LOVE_LANGUAGES[loveLanguageKey]
  const accent = ACCENT_COLORS[loveLanguageKey] ?? ACCENT_COLORS.words

  return (
    <div
      className="bg-white rounded-2xl shadow-warm-sm hover:-translate-y-0.5 hover:shadow-warm transition-all duration-200 p-4 flex gap-3 items-start animate-fade-in-up"
      style={{ borderRight: `4px solid ${accent.border}` }}
    >
      <span
        className="text-2xl mt-0.5 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: accent.bg }}
      >
        {lang?.emoji ?? '💡'}
      </span>
      <p className="text-gray-700 text-sm leading-relaxed flex-1">{suggestion}</p>
    </div>
  )
}
