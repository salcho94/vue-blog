import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { ensureUserProfile } from './users'

const provider = new GoogleAuthProvider()

export async function signupWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await ensureUserProfile(cred.user)
  return cred.user
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserProfile(cred.user)
  return cred.user
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, provider)
  await ensureUserProfile(cred.user)
  return cred.user
}

export async function logoutUser() {
  await signOut(auth)
}
