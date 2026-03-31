import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { LOVE_LANGUAGES } from '../data/suggestions'

const LANG_KEYS = Object.keys(LOVE_LANGUAGES)

export default function OnboardingScreen({ user }) {
  const [step, setStep]       = useState('gender') // 'gender' | 'name' | 'lang'
  const [gender, setGender]   = useState(null)     // 'male' | 'female'
  const [name, setName]       = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const stepIndex = { gender: 0, name: 1, lang: 2 }[step]

  async function handleSave() {
    if (!name.trim() || !selected || !gender) return
    setLoading(true)
    setError('')
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName:  name.trim(),
        loveLanguage: selected,
        gender,
      }, { merge: true })
    } catch (e) {
      setError('حدث خطأ. جرب تاني.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6" style={{ background: 'linear-gradient(160deg, #fff0f3 0%, #fffaf9 55%)' }}>

      {/* Header */}
      <div className="text-center mb-6 pt-6">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-warm-lg">
          <span className="text-3xl animate-heartbeat">💗</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-900">إعداد حسابك</h1>
        <p className="text-gray-400 text-sm mt-1">3 خطوات بس وهتبدأ 🚀</p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === stepIndex ? 'w-6 bg-brand-600' : i < stepIndex ? 'w-2 bg-brand-400' : 'w-2 bg-brand-100'
            }`}
          />
        ))}
      </div>

      {/* ── Step 1: Gender ── */}
      {step === 'gender' && (
        <div className="flex-1 flex flex-col animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-warm border border-brand-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-brand-900 mb-1">أنت...؟</h2>
            <p className="text-gray-400 text-sm mb-5">
              عشان التطبيق يتكلم معاك بشكل صح 😊
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 ${
                  gender === 'male'
                    ? 'border-brand-500 bg-brand-50 shadow-warm'
                    : 'border-gray-100 bg-gray-50 hover:border-brand-200'
                }`}
              >
                <span className="text-4xl">👨</span>
                <span className={`font-bold text-sm ${gender === 'male' ? 'text-brand-700' : 'text-gray-700'}`}>
                  رجل
                </span>
                {gender === 'male' && <span className="text-brand-500 text-xs">✓</span>}
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all active:scale-95 ${
                  gender === 'female'
                    ? 'border-brand-500 bg-brand-50 shadow-warm'
                    : 'border-gray-100 bg-gray-50 hover:border-brand-200'
                }`}
              >
                <span className="text-4xl">👩</span>
                <span className={`font-bold text-sm ${gender === 'female' ? 'text-brand-700' : 'text-gray-700'}`}>
                  ست
                </span>
                {gender === 'female' && <span className="text-brand-500 text-xs">✓</span>}
              </button>
            </div>
          </div>
          <button
            onClick={() => { if (gender) setStep('name') }}
            disabled={!gender}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl py-4 transition-all active:scale-95 shadow-warm-lg disabled:opacity-40"
          >
            التالي →
          </button>
        </div>
      )}

      {/* ── Step 2: Name ── */}
      {step === 'name' && (
        <div className="flex-1 flex flex-col animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-warm border border-brand-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-brand-900 mb-1">اسمك إيه؟</h2>
            <p className="text-gray-400 text-sm mb-4">ده اللي هيشوفه شريكك في التطبيق.</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك..."
              maxLength={30}
              autoFocus
              className="w-full bg-brand-50 border-2 border-brand-100 rounded-2xl py-3.5 px-4 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-400 text-base font-medium"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('gender')}
              className="flex-none px-5 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl transition-all active:scale-95"
            >
              ← رجوع
            </button>
            <button
              onClick={() => { if (name.trim().length > 0) setStep('lang') }}
              disabled={name.trim().length === 0}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl py-4 transition-all active:scale-95 shadow-warm-lg disabled:opacity-40"
            >
              التالي →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Love Language ── */}
      {step === 'lang' && (
        <div className="flex-1 flex flex-col animate-fade-in-up">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-amber-800 text-sm font-bold mb-1">💡 لغات الحب إيه؟</p>
            <p className="text-amber-700 text-xs leading-relaxed">
              كل واحد بيحس بالحب بطريقة مختلفة. اختار اللي بيوصفك أكتر — ده هيخلي اقتراحات التطبيق تبقى دقيقة لشريكك.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 mb-6">
            {LANG_KEYS.map((key) => {
              const lang       = LOVE_LANGUAGES[key]
              const isSelected = selected === key
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full rounded-2xl border-2 p-4 text-right transition-all active:scale-95 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 shadow-warm'
                      : 'border-gray-100 bg-white hover:border-brand-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{lang.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isSelected ? 'text-brand-700' : 'text-gray-800'}`}>
                        {lang.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {lang.description}
                      </p>
                    </div>
                    {isSelected && <span className="text-brand-500 text-lg mt-0.5">✓</span>}
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
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl py-4 transition-all active:scale-95 shadow-warm-lg disabled:opacity-40"
            >
              {loading ? '⏳ جاري الحفظ...' : 'يلا نبدأ! 🚀'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-brand-600 text-sm text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
