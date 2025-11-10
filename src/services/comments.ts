import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Comment } from '@/types/comment'

const commentsCol = collection(db, 'comments')

export async function addComment(input: {
  postId: string
  authorId: string
  authorName?: string
  content: string
}) {
  await addDoc(commentsCol, {
    ...input,
    createdAt: serverTimestamp(),
  })
}

export async function getComments(postId: string): Promise<Comment[]> {
  const q = query(
    commentsCol,
    where('postId', '==', postId),
    orderBy('createdAt', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      }) as Comment,
  )
}

export async function deleteComment(id: string) {
  await deleteDoc(doc(db, 'comments', id))
}
