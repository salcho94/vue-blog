// src/services/posts.ts
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
  startAfter,
  limit as qLimit,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post } from '@/types/post'

const postsCol = collection(db, 'posts')
import type { Category } from '@/types/post'

interface CreatePostInput {
  title: string
  summary: string
  content: string
  tags: string[]
  category: Category        // ✅ 추가
  authorId: string
  authorName: string
  isPublished: boolean
}
/** 새 포스트 생성 */
export async function createPost(input: {
  title: string
  content: string
  summary?: string
  thumbnailUrl?: string
  tags?: string[]
  category: Category        // ✅ 필수 카테고리
  authorId: string
  authorName?: string
  isPublished?: boolean
}): Promise<string> {
  const docRef = await addDoc(postsCol, {
    title: input.title,
    content: input.content,
    summary: input.summary ?? '',
    thumbnailUrl: input.thumbnailUrl ?? null,

    category: input.category,
    tags: input.tags ?? [],

    authorId: input.authorId,
    authorName: input.authorName ?? 'user',

    views: 0,
    likes: 0,
    isPublished: input.isPublished ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}
/** 포스트 수정 */
export async function updatePost(id: string, data: Partial<Post>) {
  const ref = doc(db, 'posts', id)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/** 공개된 포스트 전체(주의: 대량이면 페이지 API 사용 권장) */
export async function getAllPublishedPosts(): Promise<Post[]> {
  const q = query(
    postsCol,
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
}

/** 기존 호환 */
export async function getAllPosts(): Promise<Post[]> {
  return getAllPublishedPosts()
}

/** 단일 포스트 */
export async function getPost(id: string): Promise<Post | null> {
  const ref = doc(db, 'posts', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Post
}

/** 포스트 삭제 */
export async function deletePost(id: string) {
  await deleteDoc(doc(db, 'posts', id))
}

/** 기존 이름 호환 */
export const removePost = deletePost

/** 조회수 +1 */
export async function incrementPostViews(id: string) {
  const ref = doc(db, 'posts', id)
  await updateDoc(ref, { views: increment(1) })
}

/** 유저의 좋아요 여부 */
export async function getUserLikeStatus(postId: string, userId: string): Promise<boolean> {
  if (!postId || !userId) return false
  const likeRef = doc(db, 'posts', postId, 'likes', userId)
  const snap = await getDoc(likeRef)
  return snap.exists()
}

/** 좋아요 토글 (서브컬렉션 + 카운트 동기화) */
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
    if (!postSnap.exists()) throw new Error('Post not found')

    const data = postSnap.data() as any
    const currentLikes = Number(data.likes || 0)

    const likeSnap = await tx.get(likeRef)
    if (likeSnap.exists()) {
      // 취소
      tx.delete(likeRef)
      const next = Math.max(currentLikes - 1, 0)
      tx.update(postRef, { likes: next })
      return { liked: false, likes: next }
    } else {
      // 추가
      tx.set(likeRef, { createdAt: serverTimestamp() })
      const next = currentLikes + 1
      tx.update(postRef, { likes: next })
      return { liked: true, likes: next }
    }
  })
}

/** 태그로 포스트 조회 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const q = query(
    postsCol,
    where('isPublished', '==', true),
    where('tags', 'array-contains', tag),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
}

/** 최신 n개 */
export async function getRecentPosts(n = 20): Promise<Post[]> {
  const q = query(
    postsCol,
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    qLimit(n),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
}

/** 태그 목록 집계(소규모 용; 규모↑ 시 별도 컬렉션 권장) */
export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  const q = query(postsCol, where('isPublished', '==', true))
  const snap = await getDocs(q)
  const counter = new Map<string, number>()
  snap.forEach(d => {
    const tags: string[] = (d.data() as any).tags || []
    tags.forEach(t => counter.set(t, (counter.get(t) ?? 0) + 1))
  })
  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/** 커서 기반 페이지네이션 */
export type PostsPageCursor = QueryDocumentSnapshot<DocumentData> | null

export async function getPublishedPostsPage(opts?: {
  limit?: number
  cursor?: PostsPageCursor
  tag?: string | null
}): Promise<{ items: Post[]; nextCursor: PostsPageCursor; isEnd: boolean }> {
  const pageSize = opts?.limit ?? 10

  // 기본 쿼리
  let qBase = query(
    postsCol,
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    qLimit(pageSize),
  )

  // 태그 필터 적용 시
  if (opts?.tag) {
    qBase = query(
      postsCol,
      where('isPublished', '==', true),
      where('tags', 'array-contains', opts.tag),
      orderBy('createdAt', 'desc'),
      qLimit(pageSize),
    )
  }

  // 커서 있으면 이어서
  if (opts?.cursor) {
    qBase = query(qBase, startAfter(opts.cursor))
  }

  const snap = await getDocs(qBase)
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null
  const isEnd = snap.docs.length < pageSize

  return { items, nextCursor, isEnd }
}
