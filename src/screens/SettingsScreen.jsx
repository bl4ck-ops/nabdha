import { useState } from 'react'
import { doc, setDoc, getDoc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { LOVE_LANGUAGES } from '../data/suggestions'

const LANG_KEYS = Object.keys(LOVE_LANGUAGES)

export default function SettingsScreen({ user, userData }) {
  const navigate = useNavigate()
  const [name, setName]                   = useState(userData?.displayName ?? '')
  const [selectedLang, setSelectedLang]   = useState(userData?.loveLanguage ?? null)
  const [gender, setGender]               = useState(userData?.gender ?? null)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [error, setError]                 = useState('')
  const [unlinking, setUnlinking]         = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)

  async function handleSave() {
    if (!name.trim() || !selectedLang) return
    setSaving(true)
    setError('')
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName:  name.trim(),
        loveLanguage: selectedLang,
        gender:       gender,
      }, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError('حدث خطأ. جرب تاني.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUnlink() {
    setUnlinking(true)
    setError('')
    try {
      const coupleSnap = await getDoc(doc(db, 'couples', userData.coupleId))
      if (coupleSnap.exists()) {
        const { partnerA, partnerB } = coupleSnap.data()
        const partnerUid = partnerA === user.uid ? partnerB : partnerA

        // Clear current user
        await updateDoc(doc(db, 'users', user.uid), {
          coupleId:       deleteField(),
          pendingCoupleId: deleteField(),
          pendingCode:    deleteField(),
        })

        // Clear partner
        if (partnerUid) {
          await updateDoc(doc(db, 'users', partnerUid), {
            coupleId:       deleteField(),
            pendingCoupleId: deleteField(),
            pendingCode:    deleteField(),
          })
        }

        // Delete couple doc
        await deleteDoc(doc(db, 'couples', userData.coupleId))
      }
      // App.jsx onSnapshot will detect missing coupleId and redirect both users to /pair
    } catch (e) {
      setError('حدث خطأ أثناء الفصل. جرب تاني.')
      setUnlinking(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #fff0f3 0%, #fffaf9 55%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          ← رجوع
        </button>
        <h1 className="text-lg font-bold text-brand-900">الإعدادات</h1>
        <div className="w-12" />
      </div>

      <div className="flex-1 px-5 pb-10">

        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-brand-100 shadow-warm p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-2xl">
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
              className="w-full bg-brand-50 border-2 border-brand-100 rounded-2xl py-3 px-4 text-gray-800 focus:outline-none focus:border-brand-400 text-sm font-medium"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="bg-white rounded-3xl border border-brand-100 shadow-warm p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">أنت</h2>
          <div className="flex gap-3">
            {[
              { value: 'male',   label: 'رجل', emoji: '👨' },
              { value: 'female', label: 'ست',  emoji: '👩' },
            ].map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => setGender(value)}
                className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl border-2 py-4 transition-all active:scale-95 ${
                  gender === value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-100 bg-gray-50 hover:border-brand-200'
                }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className={`font-bold text-xs ${gender === value ? 'text-brand-700' : 'text-gray-700'}`}>
                  {label}
                </span>
                {gender === value && <span className="text-brand-500 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Love Language */}
        <div className="bg-white rounded-3xl border border-brand-100 shadow-warm p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">لغة حبك</h2>
          <div className="flex flex-col gap-2">
            {LANG_KEYS.map((key) => {
              const lang       = LOVE_LANGUAGES[key]
              const isSelected = selectedLang === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedLang(key)}
                  className={`flex items-center gap-3 w-full rounded-xl border-2 p-3 text-right transition-all active:scale-95 ${
                    isSelected
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-gray-100 bg-gray-50 hover:border-brand-200'
                  }`}
                >
                  <span className="text-xl">{lang.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-xs ${isSelected ? 'text-brand-700' : 'text-gray-700'}`}>
                      {lang.label}
                    </p>
                  </div>
                  {isSelected && <span className="text-brand-400">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || !selectedLang}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl py-4 mb-3 transition-all active:scale-95 shadow-warm-lg disabled:opacity-50"
        >
          {saving ? '⏳ جاري الحفظ...' : saved ? '✅ تم الحفظ!' : 'حفظ التغييرات'}
        </button>

        {error && (
          <p className="text-brand-600 text-sm text-center mb-3">{error}</p>
        )}

        {/* ── Danger zone: Unlink ── */}
        {userData?.coupleId && (
          <div className="mb-3">
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">منطقة الخطر</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {!showUnlinkConfirm ? (
              <button
                onClick={() => setShowUnlinkConfirm(true)}
                className="w-full bg-white border-2 border-red-200 hover:border-red-400 text-red-500 font-bold rounded-2xl py-3.5 transition-all active:scale-95"
              >
                ⚠️ فصل الارتباط بشريكك
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-700 text-sm font-bold mb-1 text-center">هل متأكد؟</p>
                <p className="text-red-600 text-xs text-center mb-4 leading-relaxed">
                  ده هيفصلك عن شريكك وهتحتاجوا تتربطوا تاني.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUnlinkConfirm(false)}
                    className="flex-1 bg-gray-100 text-gray-600 font-bold rounded-xl py-3 transition-all active:scale-95 text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleUnlink}
                    disabled={unlinking}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl py-3 transition-all active:scale-95 disabled:opacity-60 text-sm"
                  >
                    {unlinking ? '⏳ جاري الفصل...' : 'تأكيد الفصل'}
                  </button>
                </div>
              </div>
            )}
          </div>
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
