// src/stores/auth.store.ts
import { defineStore } from 'pinia'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    initialized: false,
    _initPromise: null as Promise<void> | null, // ★ 추가: 중복 init 방지
  }),

  actions: {
    init(): Promise<void> {
      if (this.initialized) return Promise.resolve()
      if (this._initPromise) return this._initPromise

      this._initPromise = new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          this.user = user
          this.initialized = true
          unsubscribe()       // 첫 이벤트 후 정리
          resolve()
        })
      })
      return this._initPromise
    },

    async login(email: string, password: string) {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      this.user = user
    },

    async signup(email: string, password: string) {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      this.user = user
    },

    async loginWithGoogle() {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      this.user = user
    },

    async logout() {
      await signOut(auth)
      this.user = null
    },
  },
})
