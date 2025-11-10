import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/types/user'

export async function ensureUserProfile(user: {
  uid: string
  email: string | null
  displayName?: string | null
  photoURL?: string | null
}) {
  if (!user.email) return

  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      role: 'user',
      createdAt: serverTimestamp(),
    }
    await setDoc(ref, profile)
  }
}
