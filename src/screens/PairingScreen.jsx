import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'
import LoadingSpinner from '../components/LoadingSpinner'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default function PairingScreen({ user, userData }) {
  const [step, setStep]               = useState(user ? 'link' : 'login')
  const [mode, setMode]               = useState(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inputCode, setInputCode]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [copied, setCopied]           = useState(false)

  // ── Step 1: Google Sign-In ──────────────────────────────
  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      setStep('link')
    } catch (e) {
      setError('حدث خطأ أثناء تسجيل الدخول. جرب تاني.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2a: Create invite code ─────────────────────────
  async function handleCreateCode() {
    setLoading(true)
    setError('')
    try {
      const uid  = auth.currentUser.uid
      const code = generateCode()
      const coupleRef = doc(collection(db, 'couples'))
      await setDoc(coupleRef, {
        partnerA: uid,
        partnerB: null,
        inviteCode: code,
        createdAt: serverTimestamp(),
      })
      await setDoc(doc(db, 'users', uid), {
        pendingCoupleId: coupleRef.id,
        pendingCode: code,
      }, { merge: true })
      setGeneratedCode(code)
      setMode('create')
    } catch (e) {
      setError('حدث خطأ. جرب تاني.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2b: Join with code ─────────────────────────────
  async function handleJoinCode() {
    if (inputCode.length !== 6) { setError('الكود لازم يكون 6 أرقام'); return }
    setLoading(true)
    setError('')
    try {
      const uid = auth.currentUser.uid
      const q   = query(collection(db, 'couples'), where('inviteCode', '==', inputCode))
      const snap = await getDocs(q)
      if (snap.empty) { setError('الكود ده مش موجود. تأكد منه وجرب تاني.'); setLoading(false); return }
      const coupleDoc  = snap.docs[0]
      const coupleData = coupleDoc.data()
      if (coupleData.partnerB)          { setError('الكود ده اتستخدم قبل كده.');          setLoading(false); return }
      if (coupleData.partnerA === uid)   { setError('مش ممكن تربط نفسك بنفسك 😄');         setLoading(false); return }
      await updateDoc(doc(db, 'couples', coupleDoc.id), { partnerB: uid })
      await setDoc(doc(db, 'users', uid),                 { coupleId: coupleDoc.id }, { merge: true })
      await setDoc(doc(db, 'users', coupleData.partnerA), { coupleId: coupleDoc.id }, { merge: true })
    } catch (e) {
      setError('حدث خطأ. جرب تاني.')
    } finally {
      setLoading(false)
    }
  }

  // ── Poll: check if partner accepted ─────────────────────
  async function handleCheckIfPaired() {
    setLoading(true)
    setError('')
    try {
      const uid      = auth.currentUser.uid
      const userSnap = await getDoc(doc(db, 'users', uid))
      const data     = userSnap.data()
      if (data?.pendingCoupleId) {
        const coupleSnap = await getDoc(doc(db, 'couples', data.pendingCoupleId))
        if (coupleSnap.exists() && coupleSnap.data().partnerB) {
          await setDoc(doc(db, 'users', uid), { coupleId: data.pendingCoupleId }, { merge: true })
        } else {
          setError('شريكك لسه مش انضم. خليه يدخل الكود.')
        }
      }
    } catch (e) {
      setError('حدث خطأ.')
    } finally {
      setLoading(false)
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #fff0f3 0%, #fffaf9 55%)' }}>

      {/* Logo / hero */}
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-warm-lg">
          <span className="text-4xl animate-heartbeat">💗</span>
        </div>
        <h1 className="text-4xl font-bold text-brand-900 mb-1">نبضة</h1>
        <p className="text-gray-400 text-sm">خلوا عينكم على قلب بعض</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-warm-xl border border-brand-100 p-6 animate-fade-in-up">

        {/* ── LOGIN ── */}
        {step === 'login' && (
          <>
            <h2 className="text-xl font-bold text-brand-900 mb-2">أهلاً وسهلاً 👋</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              ابدأ بتسجيل الدخول بحساب جوجل بتاعك.
            </p>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-3.5 px-4 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm disabled:opacity-60"
            >
              <GoogleIcon />
              تسجيل الدخول بـ Google
            </button>
          </>
        )}

        {/* ── LINK – choose mode ── */}
        {step === 'link' && mode === null && (
          <>
            <h2 className="text-xl font-bold text-brand-900 mb-2">ربط الحساب بشريكك 🔗</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              عشان تشوفوا بطاريات بعض، محتاج تربطوا الحسابات.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCreateCode}
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl py-3.5 transition-all active:scale-95 shadow-warm-lg disabled:opacity-60"
              >
                🎲 اعمل كود دعوة جديد
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={loading}
                className="w-full bg-white border-2 border-brand-200 hover:border-brand-400 text-brand-600 font-bold rounded-2xl py-3.5 transition-all active:scale-95 disabled:opacity-60"
              >
                🔑 عندي كود من شريكي
              </button>
            </div>
          </>
        )}

        {/* ── LINK – show generated code ── */}
        {step === 'link' && mode === 'create' && (
          <>
            <h2 className="text-xl font-bold text-brand-900 mb-2">كودك الخاص 🎉</h2>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              ابعت الكود ده لشريكك. لما يدخله، هتتربطوا مع بعض.
            </p>
            <div
              onClick={copyCode}
              className="flex items-center justify-between bg-brand-50 border-2 border-brand-200 rounded-2xl p-4 mb-4 cursor-pointer hover:bg-brand-100 transition-all"
            >
              <span className="text-3xl font-bold text-brand-700 tracking-widest">{generatedCode}</span>
              <span className="text-sm text-brand-400">{copied ? '✅ اتنسخ' : '📋 انسخ'}</span>
            </div>
            <button
              onClick={handleCheckIfPaired}
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl py-3.5 transition-all active:scale-95 shadow-warm-lg disabled:opacity-60"
            >
              {loading ? '⏳ بنتحقق...' : '🔄 شريكي دخل الكود؟'}
            </button>
            <button
              onClick={() => { setMode(null); setGeneratedCode('') }}
              className="w-full mt-2 text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
            >
              رجوع
            </button>
          </>
        )}

        {/* ── LINK – enter partner's code ── */}
        {step === 'link' && mode === 'join' && (
          <>
            <h2 className="text-xl font-bold text-brand-900 mb-2">أدخل الكود 🔑</h2>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              اطلب من شريكك كوده وادخله هنا.
            </p>
            <input
              type="number"
              inputMode="numeric"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-3xl font-bold tracking-widest bg-brand-50 border-2 border-brand-200 rounded-2xl py-4 text-brand-700 placeholder-brand-200 focus:outline-none focus:border-brand-500 mb-4"
              style={{ letterSpacing: '0.3em' }}
            />
            <button
              onClick={handleJoinCode}
              disabled={loading || inputCode.length !== 6}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl py-3.5 transition-all active:scale-95 shadow-warm-lg disabled:opacity-60"
            >
              {loading ? '⏳ بنتحقق...' : '✅ ربط الحساب'}
            </button>
            <button
              onClick={() => { setMode(null); setInputCode('') }}
              className="w-full mt-2 text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
            >
              رجوع
            </button>
          </>
        )}

        {error && (
          <p className="mt-4 text-brand-600 text-sm text-center bg-brand-50 rounded-xl py-2 px-3">
            ⚠️ {error}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        نبضة — تطبيق للأزواج فقط ❤️
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
