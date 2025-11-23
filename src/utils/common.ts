import { db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

function getDateKey() {
    return new Date().toISOString().slice(0, 10) // "2025-11-23"
}

function getOrCreateVisitorId() {
    const KEY = 'salcho_visitor_id'
    let id = localStorage.getItem(KEY)
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(KEY, id)
    }
    return id
}

export async function logMainVisit() {
    const visitorId = getOrCreateVisitorId() // ❗ this 쓰면 안 됨
    const dateKey = getDateKey()

    const ref = doc(db, 'dailyVisitors', dateKey, 'visitors', visitorId)

    await setDoc(
        ref,
        {
            lastVisitAt: serverTimestamp(),
            lastPath: '/',
        },
        { merge: true },
    )
}
