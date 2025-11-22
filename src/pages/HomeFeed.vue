<!-- src/pages/Chat.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getAllTags, getPublishedPostsPage, type PostsPageCursor } from '@/services/posts'
import type { Post } from '@/types/post'

const route = useRoute()

// 데이터
const all = ref<Post[]>([])                 // 누적 목록
const tags = ref<{ name: string; count: number }[]>([])
const loading = ref(true)
const errorMsg = ref('')

// UI 상태
const search = ref('')
const selectedTag = ref<string | null>(null)

// 페이지네이션 상태
const cursor = ref<PostsPageCursor>(null)
const loadingMore = ref(false)
const isEnd = ref(false)
const PAGE_SIZE = 4

// 최초 로드 & 쿼리 태그 반영
const bootstrap = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const qTag = (route.query.tag as string) || null
    selectedTag.value = qTag
    const [tagList, first] = await Promise.all([
      getAllTags(),
      getPublishedPostsPage({ limit: PAGE_SIZE, tag: selectedTag.value })
    ])
    tags.value = tagList
    all.value = first.items
    cursor.value = first.nextCursor
    isEnd.value = first.isEnd
  } catch (e: any) {
    errorMsg.value = e?.message || '피드를 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(bootstrap)

// 태그 토글 (서버 재조회)
const toggleTag = async (name: string) => {
  selectedTag.value = selectedTag.value === name ? null : name
}

// 태그 변경 시 초기화 후 재로드
watch(selectedTag, async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const page = await getPublishedPostsPage({ limit: PAGE_SIZE, tag: selectedTag.value })
    all.value = page.items
    cursor.value = page.nextCursor
    isEnd.value = page.isEnd
  } catch (e: any) {
    errorMsg.value = e?.message || '피드를 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
})

// 더보기
const loadMore = async () => {
  if (loadingMore.value || isEnd.value) return
  loadingMore.value = true
  try {
    const page = await getPublishedPostsPage({
      limit: PAGE_SIZE,
      cursor: cursor.value,
      tag: selectedTag.value
    })
    all.value = all.value.concat(page.items)
    cursor.value = page.nextCursor
    isEnd.value = page.isEnd
  } catch (e: any) {
    // 조용히 무시 or 표시
  } finally {
    loadingMore.value = false
  }
}

// 검색(클라이언트 측)
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return all.value
  return all.value.filter(p => {
    const title = (p.title || '').toLowerCase()
    const summary = (p.summary || '').toLowerCase()
    const content = (p.content || '').toLowerCase()
    const author = (p.authorName || '').toLowerCase()
    return title.includes(q) || summary.includes(q) || content.includes(q) || author.includes(q)
  })
})

// 정렬(서버가 createdAt desc로 내려주지만 안전하게 한 번 더)
const sorted = computed(() => {
  return [...filtered.value].sort((a, b) => {
    const aTime = (a.createdAt as any)?.toMillis?.() ?? (a.updatedAt as any)?.toMillis?.() ?? 0
    const bTime = (b.createdAt as any)?.toMillis?.() ?? (b.updatedAt as any)?.toMillis?.() ?? 0
    return bTime - aTime
  })
})

// 날짜 포맷
const fmt = (ts: any) => {
  try {
    const d = ts?.toDate?.() as Date
    if (d) return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {}
  return ''
}

/** --- 인피니트 스크롤 (옵션) --- */
const sentinel = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

onMounted(() => {
  io = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) loadMore()
  }, { rootMargin: '120px' }) // 조금 여유
  if (sentinel.value) io.observe(sentinel.value)
})
onBeforeUnmount(() => {
  if (io && sentinel.value) io.unobserve(sentinel.value)
  io?.disconnect()
})
</script>

<template>
  <div class="space-y-4">
    <!-- 검색/태그 바 동일 (생략 가능) -->
    <section class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 md:p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex-1 max-w-xl">
          <input
            v-model="search"
            type="search"
            placeholder="검색: 제목, 요약, 본문, 작성자"
            class="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 md:py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-black dark:focus:ring-yellow-400"
          />
        </div>
        <div class="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
          <span v-if="selectedTag">#{{ selectedTag }}</span>
          <button
            v-if="selectedTag"
            class="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 hover:border-black dark:hover:border-yellow-400"
            @click="selectedTag = null"
          >
            태그 해제
          </button>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <button
          v-for="t in tags"
          :key="t.name"
          @click="toggleTag(t.name)"
          class="px-2 py-1 rounded-md text-[12px] border transition hover:border-black dark:hover:border-yellow-400"
          :class="[
            selectedTag === t.name
              ? 'bg-black text-white dark:bg-yellow-400 dark:text-black border-transparent'
              : 'bg-slate-100 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
          ]"
        >
          #{{ t.name }} <span class="opacity-60">({{ t.count }})</span>
        </button>
      </div>
    </section>

    <!-- 상태 -->
    <div v-if="loading" class="text-sm text-slate-500">피드 로딩 중...</div>
    <div v-else-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</div>

    <!-- 목록 -->
    <section v-else>
      <div
        v-if="sorted.length === 0"
        class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 text-center text-slate-500"
      >
        게시글이 없습니다.
      </div>

      <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <li
          v-for="p in sorted"
          :key="p.id"
          class="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 hover:shadow-lg transition-shadow"
        >
          <RouterLink
            :to="{ name: 'post-detail', params: { id: String(p.id) } }"
            class="block text-[18px] md:text-[19px] font-semibold text-slate-900 dark:text-slate-100 group-hover:underline underline-offset-4"
          >
            {{ p.title || 'untitled.md' }}
          </RouterLink>

          <div class="mt-1 text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{{ p.authorName || '익명' }}</span>
            <span>·</span>
            <span>{{ fmt(p.createdAt) }}</span>
            <span class="ml-auto">{{ p.views ?? 0 }} views · {{ p.likes ?? 0 }} likes</span>
          </div>

          <p class="mt-3 text-[14px] leading-relaxed text-slate-700 dark:text-slate-200 line-clamp-3">
            {{ p.summary || p.content }}
          </p>

          <div class="mt-3 flex flex-wrap gap-1">
            <span
              v-for="t in (p.tags || [])"
              :key="t"
              class="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200"
            >
              #{{ t }}
            </span>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <RouterLink
              :to="{ name: 'post-detail', params: { id: String(p.id) } }"
              class="px-3 py-1.5 rounded-md text-[12px] font-semibold
                     bg-black text-white hover:bg-slate-800
                     dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300
                     transition"
            >
              자세히 보기
            </RouterLink>
          </div>
        </li>
      </ul>

      <!-- 더보기 / 로딩 / 끝 -->
      <div class="mt-4 flex items-center justify-center">
        <button
          v-if="!isEnd"
          @click="loadMore"
          :disabled="loadingMore"
          class="px-4 py-2 rounded-md text-[13px] font-semibold
                 border border-slate-300 dark:border-slate-700
                 hover:border-black dark:hover:border-yellow-400
                 disabled:opacity-60"
        >
          {{ loadingMore ? '불러오는 중...' : '더보기' }}
        </button>
        <span v-else class="text-[12px] text-slate-500">마지막 페이지</span>
      </div>

      <!-- 인피니트 스크롤 센티넬 (옵션) -->
      <div ref="sentinel" class="h-6"></div>
    </section>
  </div>
</template>
