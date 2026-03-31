import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { LOVE_LANGUAGES } from '../data/suggestions'

const LANG_KEYS = Object.keys(LOVE_LANGUAGES)

export default function OnboardingScreen({ user }) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('name') // 'name' | 'lang'

  async function handleSave() {
    if (!name.trim() || !selected) return
    setLoading(true)
    setError('')
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name.trim(),
        loveLanguage: selected,
      }, { merge: true })
    } catch (e) {
      setError('حدث خطأ. جرب تاني.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col p-6">
      {/* Header */}
      <div className="text-center mb-8 pt-6">
        <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-200">
          <span className="text-3xl">💗</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">إعداد حسابك</h1>
        <p className="text-gray-500 text-sm mt-1">خطوة واحدة بس وهتبدأ 🚀</p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        <div className={`h-2 rounded-full transition-all duration-300 ${step === 'name' ? 'w-6 bg-rose-500' : 'w-2 bg-rose-300'}`} />
        <div className={`h-2 rounded-full transition-all duration-300 ${step === 'lang' ? 'w-6 bg-rose-500' : 'w-2 bg-rose-200'}`} />
      </div>

      {/* ── Step 1: Name ── */}
      {step === 'name' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-3xl shadow-xl shadow-rose-100/50 border border-rose-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">اسمك إيه؟</h2>
            <p className="text-gray-500 text-sm mb-4">ده اللي هيشوفه شريكك في التطبيق.</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك..."
              maxLength={30}
              className="w-full bg-rose-50 border-2 border-rose-100 rounded-2xl py-3.5 px-4 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-rose-400 text-base font-medium"
            />
          </div>
          <button
            onClick={() => { if (name.trim().length > 0) setStep('lang') }}
            disabled={name.trim().length === 0}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl py-4 transition-all active:scale-95 shadow-md shadow-rose-200 disabled:opacity-40"
          >
            التالي →
          </button>
        </div>
      )}

      {/* ── Step 2: Love Language ── */}
      {step === 'lang' && (
        <div className="flex-1 flex flex-col">
          {/* Explainer card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-800 text-sm font-bold mb-1">💡 لغات الحب إيه؟</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              كل واحد بيحس بالحب بطريقة مختلفة. اختار اللي بيوصفك أكتر — ده هيخلي اقتراحات التطبيق تبقى دقيقة لشريكك.
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {LANG_KEYS.map((key) => {
              const lang = LOVE_LANGUAGES[key]
              const isSelected = selected === key
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full rounded-2xl border-2 p-4 text-right transition-all active:scale-95 ${
                    isSelected
                      ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100'
                      : 'border-gray-100 bg-white hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{lang.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isSelected ? 'text-rose-700' : 'text-gray-800'}`}>
                        {lang.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {lang.description}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-rose-500 text-lg mt-0.5">✓</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('name')}
              className="flex-none px-5 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all active:scale-95"
            >
              ← رجوع
            </button>
            <button
              onClick={handleSave}
              disabled={!selected || loading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl py-4 transition-all active:scale-95 shadow-md shadow-rose-200 disabled:opacity-40"
            >
              {loading ? '⏳ جاري الحفظ...' : 'يلا نبدأ! 🚀'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-rose-500 text-sm text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
