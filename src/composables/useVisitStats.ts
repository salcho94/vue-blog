import { ref } from 'vue'
import { db } from '@/lib/firebase'
import { collection, getCountFromServer } from 'firebase/firestore'

function dateKey(offsetDays = 0) {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return d.toISOString().slice(0, 10)
}

export function useVisitStats() {
    const todayVisitors = ref(0)
    const yesterdayVisitors = ref(0)
    const loading = ref(false)
    const error = ref('')

    const load = async () => {
        loading.value = true
        error.value = ''

        try {
            const todayKey = dateKey(0)
            const yesterdayKey = dateKey(-1)

            const todaySnap = await getCountFromServer(
                collection(db, 'dailyVisitors', todayKey, 'visitors'),
            )
            const yesterdaySnap = await getCountFromServer(
                collection(db, 'dailyVisitors', yesterdayKey, 'visitors'),
            )

            todayVisitors.value = todaySnap.data().count
            yesterdayVisitors.value = yesterdaySnap.data().count
        } catch (e: any) {
            console.error(e)
            error.value = e?.message || '방문자 통계를 불러오지 못했습니다.'
        } finally {
            loading.value = false
        }
    }

    return {
        todayVisitors,
        yesterdayVisitors,
        loading,
        error,
        load,
    }
}
