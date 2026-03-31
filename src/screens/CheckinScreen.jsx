import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'

const OPTIONS = [
  { emoji: '😔', label: 'تعبان جداً', level: 10 },
  { emoji: '😕', label: 'مش تمام', level: 30 },
  { emoji: '😐', label: 'عادي', level: 50 },
  { emoji: '🙂', label: 'كويس', level: 75 },
  { emoji: '😄', label: 'ممتاز!', level: 100 },
]

export default function CheckinScreen({ user, userData }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

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
      setTimeout(() => navigate('/'), 1500)
    } catch (e) {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800">تمام!</h2>
        <p className="text-gray-500">بطاريتك اتحدثت 💗</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pt-10">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          ✕ إلغاء
        </button>
        <h1 className="text-base font-bold text-gray-700">تشيك-إن</h1>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Question */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <span className="text-4xl">
              {selected !== null ? OPTIONS[selected].emoji : '💗'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            إزيك النهارده؟
          </h2>
          <p className="text-gray-500 text-sm">
            {userData?.displayName}، إيه أحسن وصف لحالك دلوقتي؟
          </p>
        </div>

        {/* Options */}
        <div className="w-full max-w-xs flex flex-col gap-3 mb-10">
          {OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-4 w-full rounded-2xl border-2 py-4 px-5 transition-all duration-200 active:scale-95 ${
                selected === i
                  ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100 scale-[1.02]'
                  : 'border-gray-100 bg-white hover:border-rose-200'
              }`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <div className="flex-1 text-right">
                <p className={`font-bold text-sm ${selected === i ? 'text-rose-700' : 'text-gray-800'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400">{opt.level}%</p>
              </div>
              {selected === i && (
                <span className="text-rose-400 text-lg">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selected === null || saving}
          className="w-full max-w-xs bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl py-4 transition-all active:scale-95 shadow-lg shadow-rose-200 disabled:opacity-40 text-base"
        >
          {saving ? '⏳ بنحفظ...' : '✅ تم — احفظ نبضتي'}
        </button>
      </div>
    </div>
  )
}
