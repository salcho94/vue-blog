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
  }),

  actions: {
    init() {
      if (this.initialized) return

      onAuthStateChanged(auth, (user) => {
        this.user = user
        this.initialized = true
      })
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
