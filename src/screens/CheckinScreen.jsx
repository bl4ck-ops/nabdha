import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { g } from '../utils/gender'

export default function CheckinScreen({ user, userData }) {
  const navigate  = useNavigate()
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)

  const gender = userData?.gender
  const name   = userData?.displayName ?? ''

  const OPTIONS = [
    { emoji: '🪫', label: g('خلصان', 'خلصانة', gender),  level: 10,  color: '#f43f5e' },
    { emoji: '😔', label: g('تعبان', 'تعبانة', gender),   level: 30,  color: '#f43f5e' },
    { emoji: '😐', label: g('ماشي', 'ماشية', gender),     level: 55,  color: '#f59e0b' },
    { emoji: '🙂', label: g('كويس', 'كويسة', gender),     level: 75,  color: '#10b981' },
    { emoji: '⚡', label: g('ممتاز', 'ممتازة', gender),   level: 100, color: '#10b981' },
  ]

  async function handleSubmit() {
    if (selected === null) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        battery: {
          level: OPTIONS[selected].level,
          updatedAt: serverTimestamp(),
        },
      }, { merge: true })
      setDone(true)
      setTimeout(() => navigate('/'), 1800)
    } catch (e) {
      setSaving(false)
    }
  }

  // ── Success overlay ──
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-5" style={{ background: 'linear-gradient(160deg, #fff0f3 0%, #fffaf9 50%)' }}>
        <span className="text-7xl animate-heartbeat">❤️</span>
        <h2 className="text-3xl font-bold text-brand-800">احساسك وصل!</h2>
        <p className="text-brand-400 text-sm">شريكك هيشوف بطاريتك دلوقتي 💗</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #fff0f3 0%, #fffaf9 50%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          ✕ إلغاء
        </button>
        <h1 className="text-base font-bold text-brand-900">بطاريتك النهارده 🔋</h1>
        <div className="w-12" />
      </div>

      {/* Prompt */}
      <div className="px-5 mb-6 animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-warm p-5 text-center">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">
              {selected !== null ? OPTIONS[selected].emoji : '💗'}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            فكّر في يومك يا {name}...{' '}
            <span className="text-gray-400">نمت كويس؟ أكلت؟ عندك ضغط؟</span>
            {' '}بناءً على ده اختار مستوى طاقتك.
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-5 pb-6 flex flex-col justify-center">
        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === i
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex items-center gap-4 w-full rounded-2xl border-2 py-4 px-5 transition-all duration-200 active:scale-95 ${
                  isSelected ? 'scale-[1.02]' : 'bg-white border-gray-100 hover:border-brand-200'
                }`}
                style={isSelected ? {
                  background: `${opt.color}12`,
                  borderColor: opt.color,
                  boxShadow: `0 4px 16px 0 ${opt.color}28`,
                } : {}}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div className="flex-1 text-right">
                  <p className="font-bold text-sm" style={{ color: isSelected ? opt.color : '#374151' }}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400">{opt.level}%</p>
                </div>
                {isSelected && (
                  <span style={{ color: opt.color }} className="text-lg font-bold">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="px-5 pb-10">
        <button
          onClick={handleSubmit}
          disabled={selected === null || saving}
          className="w-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold rounded-2xl py-4 transition-all shadow-warm-xl disabled:opacity-40 text-base"
        >
          {saving ? '⏳ بنحفظ...' : '✅ احفظ نبضتي'}
        </button>
      </div>
    </div>
  )
}
