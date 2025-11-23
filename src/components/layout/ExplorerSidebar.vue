<!-- src/components/layout/ExplorerSidebar.vue -->
<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { Post } from '@/types/post'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps<{
  posts: Post[]
  activePostId: string | null
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  (e: 'open-post', post: Post): void
}>()

// ✅ 카테고리 순서 고정 (원하면 순서/라벨 수정)
const CATEGORY_ORDER = ['Java', 'TypeScript', 'JavaScript', 'React', 'Vue', '여행', 'Other']
const auth = useAuthStore()
// 카테고리별 그룹핑
const grouped = computed(() => {
  const map = new Map<string, Post[]>()

  for (const p of props.posts) {
    const c = (p as any).category || 'Other'
    if (!map.has(c)) map.set(c, [])
    map.get(c)!.push(p)
  }

  // 정해둔 순서대로 정렬 + 없는 건 뒤에
  const result: { category: string; posts: Post[] }[] = []

  for (const c of CATEGORY_ORDER) {
    const arr = map.get(c)
    if (arr && arr.length) {
      result.push({ category: c, posts: arr })
      map.delete(c)
    }
  }

  // 나머지 카테고리들 (혹시 추가된 것들)
  for (const [c, arr] of map.entries()) {
    result.push({ category: c, posts: arr })
  }

  return result
})

// 카테고리 접기/펴기 상태
const openCategories = ref<Record<string, boolean>>({})

// ✅ 전체 열림 상태 계산
const allOpen = computed(() => {
    const groups = grouped.value
    if (!groups.length) return false
    return groups.every((g) => openCategories.value[g.category])
})

// ✅ 전체 열기/닫기 토글
const toggleAllCategories = () => {
    const target = !allOpen.value
    for (const g of grouped.value) {
        openCategories.value[g.category] = target
    }
}

watch(
    grouped,
    (groups) => {
        const next: Record<string, boolean> = {}
        for (const g of groups) {
            next[g.category] = false
        }
        openCategories.value = next
    },
    { immediate: true },
)

// 현재 글 버튼 DOM refs -> active일 때 자동 스크롤
const containerRef = ref<HTMLDivElement | null>(null)
const postItemRefs = ref<Record<string, HTMLButtonElement | null>>({})

function setPostItemRef(id: string, el: HTMLButtonElement | null) {
  postItemRefs.value[id] = el
}

// activePostId 변경 시 explorer 스크롤 + 카테고리 열림 상태 맞추기
watch(
    () => props.activePostId,
    async (id) => {
        if (!id) return


        const groups = grouped.value
        let targetCategory: string | null = null

        for (const g of groups) {
            if (g.posts.some((p) => String(p.id) === id)) {
                targetCategory = g.category
                break
            }
        }

        if (targetCategory) {
            const next: Record<string, boolean> = {}
            for (const g of groups) {
                next[g.category] = g.category === targetCategory
            }
            openCategories.value = next
        }

        await nextTick()
        const el = postItemRefs.value[id]
        const container = containerRef.value
        if (el && container) {
            const elRect = el.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            const offset = elRect.top - containerRect.top

            if (offset < 0 || offset > container.clientHeight - 40) {
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
        }
    },
    { immediate: true },
)

</script>

<template>
    <aside
            class="hidden md:flex w-64 flex-col gap-2 rounded-2xl
         border border-slate-200 dark:border-slate-800
         bg-white/95 dark:bg-slate-950/95
         p-3 text-[11px] text-slate-600 dark:text-slate-400
         sticky top-20 self-start max-h-[calc(100vh-6rem)]"
    >
        <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] uppercase tracking-[0.14em]">explorer</span>

            <!-- 🔥 전체 열기 / 닫기 토글 -->
            <button
                    type="button"
                    class="text-[10px] px-1.5 py-0.5 rounded
               text-slate-500 hover:text-slate-800
               dark:text-slate-400 dark:hover:text-slate-200
               hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    @click="toggleAllCategories"
            >
                {{ allOpen ? '전체 닫기' : '전체 열기' }}
            </button>
        </div>
    <p class="text-[10px] mb-1 text-slate-400 dark:text-slate-500">
      게시글
    </p>

    <!-- 로딩 / 에러 -->
    <div v-if="loading" class="pl-1 text-[10px] text-slate-500">
      loading posts...
    </div>
    <div v-else-if="error" class="pl-1 text-[10px] text-red-400">
      {{ error }}
    </div>

    <!-- 트리 구조 -->
    <div
      v-else
      ref="containerRef"
      class="pl-1 space-y-1 overflow-y-auto scroll-theme flex-1"
    >
      <div
        v-for="group in grouped"
        :key="group.category"
        class="space-y-0.5"
      >
        <!-- 카테고리 헤더 -->
        <button
          type="button"
          class="flex w-full items-center justify-between px-1 py-1
                 text-[10px] font-medium
                 text-slate-500 dark:text-slate-400
                 hover:text-slate-800 dark:hover:text-slate-200"
          @click="openCategories[group.category] = !openCategories[group.category]"
        >
          <span class="flex items-center gap-1">
            <span
              class="inline-flex h-3 w-3 items-center justify-center
                     rounded-sm border border-slate-400/60
                     text-[9px] text-slate-500"
            >
              {{ openCategories[group.category] ? '−' : '+' }}
            </span>
            <span>{{ group.category }}</span>
          </span>
          <span class="text-[9px] text-slate-400">
            {{ group.posts.length }}
          </span>
        </button>

        <!-- 해당 카테고리의 포스트 -->
        <transition name="fade">
          <div
            v-show="openCategories[group.category]"
            class="pl-4 space-y-0.5"
          >
            <button
              v-for="p in group.posts"
              :key="p.id"
              :ref="(el) => setPostItemRef(String(p.id), el as HTMLButtonElement | null)"
              type="button"
              @click="emit('open-post', p)"
              class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5
                     text-left transition-colors"
              :class="
                activePostId === String(p.id)
                  ? 'bg-slate-200 text-black dark:bg-slate-800 dark:text-yellow-400'
                  : 'hover:bg-slate-100 hover:text-black dark:hover:bg-slate-900 dark:hover:text-yellow-300'
              "
            >
              <span class="truncate">{{ p.title || 'untitled.md' }}</span>
              <span class="text-[9px] text-slate-400">{{ p.views ?? 0 }}v</span>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- 하단 상태 -->
    <div
      class="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800
             text-[10px] text-slate-500 dark:text-slate-600"
    >
      <p>
        auth:
        <span class="font-semibold text-black dark:text-yellow-400">
          <template v-if="$auth?.user">
            {{ $auth.user.email }}
            <span class="ml-1 text-[11px] text-slate-500 dark:text-slate-300">
              ({{ $auth.profile?.role || 'user' }})
            </span>
          </template>
          <template v-else>
            guest
          </template>
        </span>
      </p>
      <p>env: <span>firebase</span></p>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease-out, height 0.12s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
