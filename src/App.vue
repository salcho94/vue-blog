<script setup lang="ts">
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from './stores/auth.store'
import { getAllPublishedPosts } from './services/posts'
import type { Post } from './types/post'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isDark = ref(true)
const posts = ref<Post[]>([])
const loadingPosts = ref(false)
const errorMsg = ref('')
const selectedPost = ref<Post | null>(null)

// 다크 모드 적용
const applyTheme = () => {
  const root = document.documentElement
  if (isDark.value) {
    root.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    root.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(async () => {
  // 테마 복원
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') isDark.value = true
  else if (saved === 'light') isDark.value = false
  applyTheme()

  // 게시글 로드
  loadingPosts.value = true
  try {
    posts.value = await getAllPublishedPosts()
  } catch (err: any) {
    errorMsg.value = err?.message || '포스트를 불러올 수 없습니다.'
  } finally {
    loadingPosts.value = false
  }
})

watch(isDark, applyTheme)

const logout = async () => {
  await auth.logout()
  router.push('/')
  selectedPost.value = null
}

const openPost = (post: Post) => {
  // 메인 화면에서 우측에 미리보기만 보여줌
  selectedPost.value = post
}

// 모바일 select
const handleMobileSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const id = target.value
  if (!id) {
    selectedPost.value = null
    return
  }
  const p = posts.value.find((post) => String(post.id) === id)
  selectedPost.value = p || null
}

// 미리보기 → 상세 페이지(댓글 포함) 이동
const goDetailFromPreview = () => {
  if (!selectedPost.value) return
  router.push(`/posts/${selectedPost.value.id}`)
}

// 현재 라우트가 상세 페이지인지 판별
const isDetailRoute = computed(() => {
  // /posts/:id 같은 라우트에서 params.id가 존재한다고 가정
  return typeof route.params.id === 'string'
})

// 라우트가 상세 페이지로 바뀌면, App.vue 쪽 선택 상태는 비워서 RouterView를 우선
watch(
  () => route.fullPath,
  () => {
    if (isDetailRoute.value) {
      selectedPost.value = null
    }
  },
)
</script>

<template>
  <div
    class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-[system-ui] text-[14px] md:text-[15px] transition-colors duration-300"
  >
    <!-- 헤더 -->
    <header
      class="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-4"
      >
        <!-- 로고 + 탭 -->
        <div class="flex items-center gap-4">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 text-[13px] font-semibold text-slate-950 shadow-[0_0_16px_rgba(56,189,248,0.45)]"
          >
            B
          </div>
          <nav class="flex items-center gap-2 text-[12px] md:text-[13px]">
            <RouterLink
              to="/"
              class="rounded-t-md px-3 py-1.5 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/70 hover:text-cyan-400 transition-colors"
              active-class="bg-slate-200 dark:bg-slate-900 text-cyan-400"
            >
              home.tsx
            </RouterLink>
            <RouterLink
              to="/posts"
              class="rounded-t-md px-3 py-1.5 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-900/70 hover:text-cyan-400 transition-colors"
              active-class="bg-slate-200 dark:bg-slate-900 text-cyan-400"
            >
              posts.ts
            </RouterLink>
            <RouterLink
              v-if="auth.user"
              to="/admin/new"
              class="rounded-t-md px-3 py-1.5 hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-900/70 transition-colors"
              active-class="bg-slate-200 dark:bg-slate-900 text-emerald-300"
            >
              draft.md
            </RouterLink>
          </nav>
        </div>

        <!-- 우측: 다크 토글 + 로그인 -->
        <div class="flex items-center gap-3">
          <button
            @click="isDark = !isDark"
            class="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-[15px] hover:border-cyan-400 hover:text-cyan-400 transition-colors"
          >
            <span v-if="isDark">🌙</span>
            <span v-else>☀️</span>
          </button>

          <div
            v-if="auth.user"
            class="flex items-center gap-2 text-[11px] md:text-[12px]"
          >
            <span
              class="max-w-[160px] truncate rounded bg-slate-100 dark:bg-slate-900 px-2 py-1 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            >
              {{ auth.user.email }}
            </span>
            <button
              @click="logout"
              class="rounded bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition-colors"
            >
              logout
            </button>
          </div>

          <div
            v-else
            class="flex items-center gap-2 text-[11px] md:text-[12px]"
          >
            <RouterLink
              to="/login"
              class="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
            >
              login
            </RouterLink>
            <RouterLink
              to="/signup"
              class="rounded bg-cyan-400 px-3 py-1.5 font-semibold text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              sign up
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <!-- 메인 레이아웃 -->
    <div class="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4 md:flex-row">
      <!-- 좌측: 게시글 리스트 (상세 페이지일 땐 그대로 두고, 선택은 미리보기용) -->
      <aside
        class="hidden md:flex w-64 flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 p-3 text-[11px] text-slate-600 dark:text-slate-400"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] uppercase tracking-[0.14em]">
            explorer
          </span>
          <span class="text-slate-500">⋯</span>
        </div>

        <p class="text-[10px] mb-1 text-slate-400 dark:text-slate-500">
          posts
        </p>

        <div class="pl-1 space-y-1 max-h-72 overflow-y-auto">
          <div
            v-if="loadingPosts"
            class="text-[10px] text-slate-400"
          >
            loading posts...
          </div>
          <div
            v-else-if="errorMsg"
            class="text-[10px] text-red-400"
          >
            {{ errorMsg }}
          </div>
          <div v-else>
            <button
              v-for="post in posts"
              :key="post.id"
              @click="openPost(post)"
              class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
              :class="
                selectedPost && selectedPost.id === post.id
                  ? 'bg-slate-200 dark:bg-slate-800 text-cyan-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-cyan-300'
              "
            >
              <span class="truncate">
                {{ post.title || 'untitled.md' }}
              </span>
              <span class="text-[9px] text-slate-400">
                {{ post.views ?? 0 }}v
              </span>
            </button>
          </div>
        </div>

        <div
          class="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-600"
        >
          <p>
            auth:
            <span class="text-cyan-400">
              {{ auth.user ? 'signed-in' : 'guest' }}
            </span>
          </p>
          <p>env: <span>firebase · gh-pages</span></p>
        </div>
      </aside>

      <!-- 우측: 본문 -->
      <main
        class="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.85)] transition-colors duration-300"
      >
        <!-- 모바일용 드롭다운 -->
        <div class="mb-3 md:hidden">
          <label
            class="block text-[11px] text-slate-500 dark:text-slate-400 mb-1"
          >
            select post
          </label>
          <select
            class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[12px]"
            @change="handleMobileSelect"
          >
            <option value="">router-view.tsx (페이지 보기)</option>
            <option
              v-for="post in posts"
              :key="post.id"
              :value="post.id"
            >
              {{ post.title || 'untitled.md' }}
            </option>
          </select>
        </div>

        <!-- 탭 바 -->
        <div
          class="mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-[10px] text-slate-500 dark:text-slate-600"
        >
          <div
            class="flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-1 text-cyan-400"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>
              <!-- 상세 라우트면 라우터 페이지 기준 이름, 아니면 선택된 포스트 or 기본 -->
              {{
                isDetailRoute
                  ? 'post.ts'
                  : selectedPost
                    ? (selectedPost.title || 'post.md')
                    : 'router-view.tsx'
              }}
            </span>
          </div>
          <div class="flex-1 text-right text-[9px]">
            Vue 3 · Firebase · Tailwind
          </div>
        </div>

        <!-- 내용 구역 -->
        <div class="leading-relaxed">
          <!-- 1. /posts/:id 상세 페이지 => RouterView (여기서 댓글 포함) -->
          <section v-if="isDetailRoute">
            <RouterView />
          </section>

          <!-- 2. 선택된 포스트 미리보기 -->
          <section
            v-else-if="selectedPost"
            class="space-y-3"
          >
            <h1
              class="text-cyan-400 text-[18px] font-semibold"
            >
              {{ selectedPost.title }}
            </h1>
            <p
              class="text-[11px] text-slate-500 dark:text-slate-400"
            >
              views: {{ selectedPost.views ?? 0 }} · likes:
              {{ selectedPost.likes ?? 0 }}
            </p>
            <div
              class="whitespace-pre-wrap text-[13px] md:text-[14px] text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 font-mono max-h-[460px] overflow-y-auto"
            >
              {{ selectedPost.content }}
            </div>

            <!-- 여기서 상세 페이지로 이동 → 댓글 가능 -->
            <button
              @click="goDetailFromPreview"
              class="mt-2 inline-flex items-center gap-1.5 rounded-md bg-cyan-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              open detail & comments
            </button>
          </section>

          <!-- 3. 기본 라우터 페이지 (홈, 전체 포스트 페이지 등) -->
          <section v-else>
            <RouterView />
          </section>
        </div>
      </main>
    </div>

    <!-- 푸터 -->
    <footer
      class="mt-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-[10px] text-slate-500 dark:text-slate-600"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 gap-4"
      >
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>connected: firestore & auth</span>
        </div>
        <div class="flex items-center gap-3">
          <span>Ln 42, Col 7</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span>TS</span>
        </div>
      </div>
    </footer>
  </div>
</template>
