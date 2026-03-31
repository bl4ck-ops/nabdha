import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Real-time listener for a partner's user document.
 * Returns { partner, loading, error }
 */
export function usePartner(partnerUid) {
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!partnerUid) {
      setPartner(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = onSnapshot(
      doc(db, 'users', partnerUid),
      (snap) => {
        if (snap.exists()) {
          setPartner({ uid: snap.id, ...snap.data() })
        } else {
          setPartner(null)
        }
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsub
  }, [partnerUid])

  return { partner, loading, error }
}
