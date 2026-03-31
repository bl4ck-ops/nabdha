import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { LOVE_LANGUAGES } from '../data/suggestions'

const LANG_KEYS = Object.keys(LOVE_LANGUAGES)

export default function SettingsScreen({ user, userData }) {
  const navigate = useNavigate()
  const [name, setName] = useState(userData?.displayName ?? '')
  const [selectedLang, setSelectedLang] = useState(userData?.loveLanguage ?? null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!name.trim() || !selectedLang) return
    setSaving(true)
    setError('')
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name.trim(),
        loveLanguage: selectedLang,
      }, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError('حدث خطأ. جرب تاني.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          ← رجوع
        </button>
        <h1 className="text-lg font-bold text-gray-800">الإعدادات</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 px-5 pb-10">
        {/* Profile */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-100/40 p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-2xl">
              {LOVE_LANGUAGES[selectedLang]?.emoji ?? '💗'}
            </div>
            <div>
              <p className="font-bold text-gray-800">{userData?.displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              الاسم المعروض
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="w-full bg-rose-50 border-2 border-rose-100 rounded-2xl py-3 px-4 text-gray-800 focus:outline-none focus:border-rose-400 text-sm font-medium"
            />
          </div>
        </div>

        {/* Love Language */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-100/40 p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">لغة حبك</h2>
          <div className="flex flex-col gap-2">
            {LANG_KEYS.map((key) => {
              const lang = LOVE_LANGUAGES[key]
              const isSelected = selectedLang === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedLang(key)}
                  className={`flex items-center gap-3 w-full rounded-xl border-2 p-3 text-right transition-all active:scale-95 ${
                    isSelected
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-100 bg-gray-50 hover:border-rose-200'
                  }`}
                >
                  <span className="text-xl">{lang.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-xs ${isSelected ? 'text-rose-700' : 'text-gray-700'}`}>
                      {lang.label}
                    </p>
                  </div>
                  {isSelected && <span className="text-rose-400">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || !selectedLang}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl py-4 mb-3 transition-all active:scale-95 shadow-md shadow-rose-200 disabled:opacity-50"
        >
          {saving ? '⏳ جاري الحفظ...' : saved ? '✅ تم الحفظ!' : 'حفظ التغييرات'}
        </button>

        {error && (
          <p className="text-rose-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl py-4 transition-all active:scale-95"
        >
          🚪 تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
