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
  runTransaction,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post } from '@/types/post'

const postsCol = collection(db, 'posts')

/**
 * 새 포스트 생성
 */
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

/**
 * 포스트 수정
 */
export async function updatePost(id: string, data: Partial<Post>) {
  const ref = doc(db, 'posts', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * 공개된 포스트 목록
 */
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

/**
 * 기존 호환용: 전체 포스트 = 공개 포스트
 */
export async function getAllPosts(): Promise<Post[]> {
  return getAllPublishedPosts()
}

/**
 * 단일 포스트 조회
 */
export async function getPost(id: string): Promise<Post | null> {
  const ref = doc(db, 'posts', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Post
}

/**
 * 포스트 삭제
 */
export async function deletePost(id: string) {
  await deleteDoc(doc(db, 'posts', id))
}

/**
 * 기존 이름 호환
 */
export const removePost = deletePost

/**
 * 조회수 +1
 */
export async function incrementPostViews(id: string) {
  const ref = doc(db, 'posts', id)
  await updateDoc(ref, { views: increment(1) })
}

/**
 * 특정 유저가 이 포스트를 좋아요 했는지 확인
 */
export async function getUserLikeStatus(
  postId: string,
  userId: string,
): Promise<boolean> {
  if (!postId || !userId) return false
  const likeRef = doc(db, 'posts', postId, 'likes', userId)
  const snap = await getDoc(likeRef)
  return snap.exists()
}

/**
 * 좋아요 토글
 * - likes 서브컬렉션 문서 생성/삭제
 * - posts.likes 카운트 증감
 */
export async function toggleLike(
  postId: string,
  userId: string,
): Promise<{ liked: boolean; likes: number }> {
  if (!postId || !userId) {
    throw new Error('invalid postId or userId')
  }

  const postRef = doc(db, 'posts', postId)
  const likeRef = doc(db, 'posts', postId, 'likes', userId)

  return runTransaction(db, async (tx) => {
    const postSnap = await tx.get(postRef)
    if (!postSnap.exists()) {
      throw new Error('Post not found')
    }

    const data = postSnap.data() as any
    const currentLikes = Number(data.likes || 0)

    const likeSnap = await tx.get(likeRef)

    if (likeSnap.exists()) {
      // 이미 좋아요 → 취소
      tx.delete(likeRef)
      const next = Math.max(currentLikes - 1, 0)
      tx.update(postRef, { likes: next })
      return { liked: false, likes: next }
    } else {
      // 아직 안 눌렀음 → 좋아요 추가
      tx.set(likeRef, { createdAt: serverTimestamp() })
      const next = currentLikes + 1
      tx.update(postRef, { likes: next })
      return { liked: true, likes: next }
    }
  })
}
