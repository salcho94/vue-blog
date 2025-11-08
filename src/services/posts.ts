// src/services/posts.ts
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

const postsCol = collection(db, 'posts')

// 글 생성
export async function createPost(title: string, content: string) {
  const user = auth.currentUser
  if (!user) throw new Error('로그인이 필요합니다.')

  const now = Timestamp.now()

  const ref = await addDoc(postsCol, {
    title,
    content,
    authorId: user.uid,
    createdAt: now,
    updatedAt: now,
  })

  return ref.id
}

// 전체 글 목록
export async function getAllPosts() {
  const q = query(postsCol, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }))
}

// 단일 글
export async function getPost(id: string) {
  const ref = doc(db, 'posts', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('글이 존재하지 않습니다.')
  return { id: snap.id, ...(snap.data() as any) }
}

// 글 수정
export async function updatePost(id: string, title: string, content: string) {
  const ref = doc(db, 'posts', id)
  await updateDoc(ref, {
    title,
    content,
    updatedAt: Timestamp.now(),
  })
}

// 글 삭제
export async function removePost(id: string) {
  const ref = doc(db, 'posts', id)
  await deleteDoc(ref)
}
