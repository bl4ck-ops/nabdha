import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, isConfigured } from './firebase'

import LoadingSpinner from './components/LoadingSpinner'
import PairingScreen from './screens/PairingScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import CheckinScreen from './screens/CheckinScreen'
import HomeScreen from './screens/HomeScreen'
import SettingsScreen from './screens/SettingsScreen'

// Shown when .env Firebase keys are missing
function SetupScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-200">
        <span className="text-4xl">💗</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">نبضة</h1>
      <p className="text-gray-500 text-sm mb-6">خلوا عينكم على قلب بعض</p>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 max-w-sm text-right">
        <p className="text-amber-800 font-bold text-sm mb-2">⚙️ محتاج إعداد Firebase</p>
        <p className="text-amber-700 text-xs leading-relaxed mb-3">
          اعمل ملف <code className="bg-amber-100 px-1 rounded">.env</code> في مجلد المشروع وحط فيه مفاتيح Firebase:
        </p>
        <div className="bg-white rounded-xl border border-amber-200 p-3 text-xs text-left font-mono text-gray-600 leading-loose">
          VITE_FIREBASE_API_KEY=...<br/>
          VITE_FIREBASE_AUTH_DOMAIN=...<br/>
          VITE_FIREBASE_PROJECT_ID=...<br/>
          VITE_FIREBASE_STORAGE_BUCKET=...<br/>
          VITE_FIREBASE_MESSAGING_SENDER_ID=...<br/>
          VITE_FIREBASE_APP_ID=...
        </div>
      </div>
    </div>
  )
}

// Actual app — only mounted when Firebase is configured
function AppWithFirebase() {
  const [authUser, setAuthUser] = useState(undefined) // undefined = still loading
  const [userData, setUserData] = useState(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user ?? null)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!authUser) {
      setUserData(null)
      return
    }
    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (snap) => {
      setUserData(snap.exists() ? { uid: authUser.uid, ...snap.data() } : null)
    })
    return unsub
  }, [authUser?.uid])

  if (authUser === undefined || (authUser && userData === undefined)) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/pair"
          element={
            authUser && userData?.coupleId
              ? <Navigate to="/" replace />
              : <PairingScreen key={authUser?.uid ?? 'guest'} user={authUser} userData={userData} />
          }
        />
        <Route
          path="/onboarding"
          element={
            !authUser
              ? <Navigate to="/pair" replace />
              : !userData?.coupleId
              ? <Navigate to="/pair" replace />
              : userData?.displayName
              ? <Navigate to="/" replace />
              : <OnboardingScreen user={authUser} />
          }
        />
        <Route
          path="/checkin"
          element={
            !authUser
              ? <Navigate to="/pair" replace />
              : !userData?.coupleId
              ? <Navigate to="/pair" replace />
              : !userData?.displayName
              ? <Navigate to="/onboarding" replace />
              : <CheckinScreen user={authUser} userData={userData} />
          }
        />
        <Route
          path="/settings"
          element={
            !authUser
              ? <Navigate to="/pair" replace />
              : !userData?.coupleId
              ? <Navigate to="/pair" replace />
              : !userData?.displayName
              ? <Navigate to="/onboarding" replace />
              : <SettingsScreen user={authUser} userData={userData} />
          }
        />
        <Route
          path="/"
          element={
            !authUser
              ? <Navigate to="/pair" replace />
              : !userData?.coupleId
              ? <Navigate to="/pair" replace />
              : !userData?.displayName
              ? <Navigate to="/onboarding" replace />
              : <HomeScreen user={authUser} userData={userData} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  if (!isConfigured) return <SetupScreen />
  return <AppWithFirebase />
}
