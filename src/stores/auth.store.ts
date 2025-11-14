// src/stores/auth.store.ts
import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User, createUserWithEmailAndPassword
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { ensureUserProfile, getUserProfile } from '@/services/users'
import type { UserProfile } from '@/types/user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    initialized: false,
    _initPromise: null as Promise<void> | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    // 지금은 admin만 글쓰기 가능하게
    canWrite: (state) => state.profile?.role === 'admin',
  },

  actions: {

    async init() {
      if (this.initialized) return
      if (this._initPromise) return this._initPromise

      this._initPromise = new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user

          if (user) {
            await ensureUserProfile({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            })
            this.profile = await getUserProfile(user.uid)
          } else {
            this.profile = null
          }

          this.initialized = true
          resolve()
        })
      })

      return this._initPromise
    },

    async signup(email: string, password: string) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      this.user = cred.user
    },

    async login(email: string, password: string) {
      const cred = await signInWithEmailAndPassword(auth, email, password)

      // 🔥 라우터에서 바로 인식할 수 있게 즉시 세팅
      this.user = cred?.user
      await ensureUserProfile({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      })
      this.profile = await getUserProfile(cred.user.uid)
      this.initialized = true
    },

    async loginWithGoogle() {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)

      this.user = cred.user
      await ensureUserProfile({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
      })
      this.profile = await getUserProfile(cred.user.uid)
      this.initialized = true
    },

    async logout() {
      await signOut(auth)
      this.user = null
      this.profile = null
      this.initialized = false
      this._initPromise = null
    },
  },
})
