import { LOVE_LANGUAGES } from '../data/suggestions'

/**
 * LoveLangCard — shows a single suggestion for the partner
 */
export default function LoveLangCard({ suggestion, loveLanguageKey }) {
  const lang = LOVE_LANGUAGES[loveLanguageKey]

  return (
    <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4 flex gap-3 items-start">
      <span className="text-2xl mt-0.5 shrink-0">{lang?.emoji ?? '💡'}</span>
      <p className="text-gray-700 text-sm leading-relaxed">{suggestion}</p>
    </div>
  )
}
