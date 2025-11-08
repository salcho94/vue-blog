import { defineStore } from 'pinia'
import { auth } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: true,
  }),
  actions: {
    init() {
      onAuthStateChanged(auth, (user) => {
        this.user = user
        this.loading = false
      })
    },
    async signup(email: string, password: string) {
      await createUserWithEmailAndPassword(auth, email, password)
    },
    async login(email: string, password: string) {
      await signInWithEmailAndPassword(auth, email, password)
    },
    async logout() {
      await signOut(auth)
      this.user = null
    },
  },
})
