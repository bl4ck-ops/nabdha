import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { usePartner } from '../hooks/usePartner'
import BatteryBar from '../components/BatteryBar'
import LoveLangCard from '../components/LoveLangCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getRandomSuggestions, getLoveLanguageLabel, LOVE_LANGUAGES } from '../data/suggestions'

function formatTime(ts) {
  if (!ts) return null
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

export default function HomeScreen({ user, userData }) {
  const navigate = useNavigate()
  const [partnerUid, setPartnerUid] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const { partner, loading: partnerLoading } = usePartner(partnerUid)

  // Find partner's UID from the couple doc
  useEffect(() => {
    async function fetchPartner() {
      if (!userData?.coupleId) return
      const coupleSnap = await getDoc(doc(db, 'couples', userData.coupleId))
      if (!coupleSnap.exists()) return
      const { partnerA, partnerB } = coupleSnap.data()
      const pUid = partnerA === user.uid ? partnerB : partnerA
      setPartnerUid(pUid)
    }
    fetchPartner()
  }, [userData?.coupleId])

  // Refresh suggestions when partner data or love language changes
  useEffect(() => {
    const langKey = userData?.loveLanguage
    if (langKey) {
      setSuggestions(getRandomSuggestions(langKey, 3))
    }
  }, [userData?.loveLanguage])

  function refreshSuggestions() {
    const langKey = userData?.loveLanguage
    if (langKey) setSuggestions(getRandomSuggestions(langKey, 3))
  }

  const myBattery = userData?.battery?.level ?? null
  const partnerBattery = partner?.battery?.level ?? null
  const partnerName = partner?.displayName ?? 'شريكك'

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm text-gray-500 hover:bg-gray-50 transition-all"
          aria-label="إعدادات"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">نبضة 💗</h1>
          <p className="text-xs text-gray-400">أهلاً، {userData?.displayName}</p>
        </div>

        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 pb-24 overflow-y-auto">
        {/* ── Batteries section ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 mb-3">مستوى النبضة 🔋</h2>
          <div className="flex flex-col gap-3">
            <BatteryBar
              name={userData?.displayName ?? 'أنا'}
              level={myBattery}
              isMe
              updatedAt={userData?.battery?.updatedAt ? formatTime(userData.battery.updatedAt) : null}
            />
            {partnerLoading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <LoadingSpinner />
              </div>
            ) : (
              <BatteryBar
                name={partnerName}
                level={partnerBattery}
                updatedAt={partner?.battery?.updatedAt ? formatTime(partner.battery.updatedAt) : null}
              />
            )}
          </div>
        </section>

        {/* ── Suggestions for partner ── */}
        {partner && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-500">
                كيف تساعد {partnerName}؟ 💡
              </h2>
              <button
                onClick={refreshSuggestions}
                className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
              >
                تجديد 🔄
              </button>
            </div>
            {partner?.loveLanguage && (
              <p className="text-xs text-gray-400 mb-3">
                لغة حبه/حبها: {LOVE_LANGUAGES[partner.loveLanguage]?.emoji} {getLoveLanguageLabel(partner.loveLanguage)}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {suggestions.map((s, i) => (
                <LoveLangCard
                  key={i}
                  suggestion={s}
                  loveLanguageKey={partner?.loveLanguage ?? 'words'}
                />
              ))}
              {suggestions.length === 0 && (
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-center">
                  <p className="text-gray-400 text-sm">شريكك لسه ما اختارش لغة الحب.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {!partner && !partnerLoading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-center">
            <p className="text-amber-700 text-sm font-bold mb-1">⏳ في انتظار شريكك</p>
            <p className="text-amber-600 text-xs">شريكك لسه مش انضم للتطبيق.</p>
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent">
        <button
          onClick={() => navigate('/checkin')}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl py-4 text-base shadow-xl shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl">💗</span>
          عمل تشيك-إن دلوقتي
        </button>
      </div>
    </div>
  )
}
