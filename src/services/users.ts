// src/services/user.ts
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile, UserRole } from '@/types/user'

const MASTER_EMAIL = 'salcho5678@gmail.com'

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
    // ✅ 새 유저 기본 role
    const role: UserRole = user.email === MASTER_EMAIL ? 'admin' : 'user'

    // undefined 안 넣고, 있는 값만 합쳐서 저장
    const base: UserProfile = {
      uid: user.uid,
      email: user.email,
      role,
      createdAt: serverTimestamp() as any,
    }

    const extra: Partial<UserProfile> = {}
    if (user.displayName) extra.displayName = user.displayName
    if (user.photoURL) extra.photoURL = user.photoURL

    await setDoc(ref, { ...base, ...extra })
  } else {
    const data = snap.data() as UserProfile
    if (user.email === MASTER_EMAIL && data.role !== 'admin') {
      await updateDoc(ref, { role: 'admin' })
    }
  }
}

// 프로필 읽는 헬퍼
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}
