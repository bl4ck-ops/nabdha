import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { usePartner } from '../hooks/usePartner'
import CircularBattery from '../components/CircularBattery'
import LoveLangCard from '../components/LoveLangCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getRandomSuggestions, getLoveLanguageLabel, LOVE_LANGUAGES } from '../data/suggestions'
import { g } from '../utils/gender'

function formatTime(ts) {
  if (!ts) return null
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'مساء النور'
  return 'مساء الخير'
}

export default function HomeScreen({ user, userData }) {
  const navigate = useNavigate()
  const [partnerUid, setPartnerUid] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const { partner, loading: partnerLoading } = usePartner(partnerUid)

  useEffect(() => {
    async function fetchPartner() {
      if (!userData?.coupleId) return
      const coupleSnap = await getDoc(doc(db, 'couples', userData.coupleId))
      if (!coupleSnap.exists()) return
      const { partnerA, partnerB } = coupleSnap.data()
      setPartnerUid(partnerA === user.uid ? partnerB : partnerA)
    }
    fetchPartner()
  }, [userData?.coupleId])

  // Suggestions are based on PARTNER's love language (what I can do FOR them)
  useEffect(() => {
    const langKey = partner?.loveLanguage
    if (langKey) setSuggestions(getRandomSuggestions(langKey, 3))
    else setSuggestions([])
  }, [partner?.loveLanguage])

  function refreshSuggestions() {
    const langKey = partner?.loveLanguage
    if (langKey) setSuggestions(getRandomSuggestions(langKey, 3))
  }

  const myBattery      = userData?.battery?.level ?? null
  const partnerBattery = partner?.battery?.level ?? null
  const partnerName    = partner?.displayName ?? 'شريكك'
  const myName         = userData?.displayName ?? ''

  // CTA text — based on partner's gender
  const ctaText = (() => {
    if (!partner) return 'سجّل احساسك 💗'
    if (partner.gender === 'female') return 'قولها إحساسك إيه 💗'
    if (partner.gender === 'male')   return 'قوليله إحساسك إيه 💗'
    return 'سجّل احساسك 💗'
  })()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #fff0f3 0%, #fffaf9 50%)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-2xl bg-white border border-brand-100 flex items-center justify-center shadow-warm-sm text-brand-400 hover:bg-brand-50 transition-all"
          aria-label="إعدادات"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold text-brand-900">نبضة 💗</h1>
          <p className="text-xs text-gray-400">{getGreeting()}، {myName}</p>
        </div>

        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 pb-28 overflow-y-auto">

        {/* ── Batteries section ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 mb-4 tracking-wide">مستوى النبضة 🔋</h2>

          <div className="bg-white rounded-3xl shadow-warm p-5 flex items-center justify-around">
            {/* Partner — large */}
            {partnerLoading ? (
              <div className="flex-1 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <CircularBattery
                name={partnerName}
                level={partnerBattery}
                updatedAt={partner?.battery?.updatedAt ? formatTime(partner.battery.updatedAt) : null}
                size="lg"
              />
            )}

            {/* Divider */}
            <div className="w-px h-20 bg-brand-100 mx-4" />

            {/* Me — small */}
            <CircularBattery
              name={myName || 'أنا'}
              level={myBattery}
              isMe
              updatedAt={userData?.battery?.updatedAt ? formatTime(userData.battery.updatedAt) : null}
              size="sm"
            />
          </div>
        </section>

        {/* ── Suggestions ── */}
        {partner && (
          <section className="mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-500">
                كيف تساعد {partnerName}؟ 💡
              </h2>
              <button
                onClick={refreshSuggestions}
                className="text-xs text-brand-500 hover:text-brand-700 transition-colors font-medium"
              >
                تجديد 🔄
              </button>
            </div>

            {partner?.loveLanguage && (
              <p className="text-xs text-gray-400 mb-3">
                لغة حبه/حبها: {LOVE_LANGUAGES[partner.loveLanguage]?.emoji}{' '}
                {getLoveLanguageLabel(partner.loveLanguage)}
              </p>
            )}

            <div className="flex flex-col gap-2.5">
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
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-center animate-fade-in-up">
            <p className="text-amber-700 text-sm font-bold mb-1">⏳ في انتظار شريكك</p>
            <p className="text-amber-600 text-xs">شريكك لسه مش انضم للتطبيق.</p>
          </div>
        )}
      </div>

      {/* ── Floating CTA ── */}
      <div className="fixed bottom-0 inset-x-0 p-5 bg-gradient-to-t from-white via-white/90 to-transparent">
        <button
          onClick={() => navigate('/checkin')}
          className="w-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold rounded-2xl py-4 text-base shadow-warm-xl transition-all flex items-center justify-center gap-2"
        >
          {ctaText}
        </button>
      </div>
    </div>
  )
}
