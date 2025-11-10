import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post } from '@/types/post'

const postsCol = collection(db, 'posts')

export async function createPost(input: {
  title: string
  content: string
  summary?: string
  thumbnailUrl?: string
  tags?: string[]
  category?: string
  authorId: string
  authorName?: string
  isPublished?: boolean
}): Promise<string> {
  const docRef = await addDoc(postsCol, {
    ...input,
    tags: input.tags || [],
    views: 0,
    likes: 0,
    isPublished: input.isPublished ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updatePost(id: string, data: Partial<Post>) {
  const ref = doc(db, 'posts', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function getAllPublishedPosts(): Promise<Post[]> {
  const q = query(
    postsCol,
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      }) as Post,
  )
}

// 기존 코드 호환용
export async function getAllPosts(): Promise<Post[]> {
  return getAllPublishedPosts()
}

export async function getPost(id: string): Promise<Post | null> {
  const ref = doc(db, 'posts', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Post
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, 'posts', id))
}

// 기존 removePost 이름 호환용
export const removePost = deletePost

export async function incrementPostViews(id: string) {
  const ref = doc(db, 'posts', id)
  await updateDoc(ref, { views: increment(1) })
}
