// src/types/user.ts
export type UserRole = 'user' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  createdAt: any
  displayName?: string
  photoURL?: string
}
