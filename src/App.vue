<!-- src/App.vue -->
<script setup lang="ts">
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { ref, onMounted, watch, computed ,onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { getAllPublishedPosts } from '@/services/posts'
import GlobalModal from '@/components/common/GlobalModal.vue'
import ExplorerSidebar from '@/components/layout/ExplorerSidebar.vue'
import type { Post } from '@/types/post'
const showMobileMenu = ref(false)
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isDark = ref(true)
const posts = ref<Post[]>([])
const loadingPosts = ref(false)
const errorMsg = ref('')


// ✅ 포스트 목록 다시 불러오기
const refreshPosts = async () => {
  loadingPosts.value = true
  try {
    posts.value = await getAllPublishedPosts()
    errorMsg.value = ''
  } catch (err: any) {
    errorMsg.value = err?.message || '포스트를 불러올 수 없습니다.'
  } finally {
    loadingPosts.value = false
  }
}


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
  auth.init?.()
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') isDark.value = true
  else if (saved === 'light') isDark.value = false
  applyTheme()

  await refreshPosts()

  // ✅ 전역 이벤트 구독: 글 생성/수정/삭제 후 다시 로드
  window.addEventListener('posts-updated', refreshPosts)
})

onUnmounted(() => {
  window.removeEventListener('posts-updated', refreshPosts)
})

watch(isDark, applyTheme)

const activePostId = computed(() => {
  if (route.name === 'post-detail' && typeof route.params.id === 'string') {
    return route.params.id
  }
  return null
})

const activePostMeta = computed(() => {
  if (route.name === 'post-detail' && typeof route.params.id === 'string') {
    const found = posts.value.find((p) => String(p.id) === route.params.id)
    if (found) {
      const createdAt =
        (found.createdAt as any)?.toDate?.().toLocaleDateString?.('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }) || ''
      return {
        title: found.title || 'untitled.md',
        author: found.authorName || '익명',
        category : (found as any).category || 'other',
        createdAt,
      }
    }
  }
  return null
})

const openPost = (post: Post) => {
  if (!post?.id) return
  router.push({ name: 'post-detail', params: { id: String(post.id) } })
}

const handleMobileSelect = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const id = target.value
  if (!id) {
    router.push({ name: 'home' })
    return
  }
  router.push({ name: 'post-detail', params: { id } })
}

const logout = async () => {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <GlobalModal />
  <div
    class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-[system-ui] text-[14px] md:text-[15px] transition-colors duration-300"
  >
    <!-- 헤더 -->
    <header
      class="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl"
    >
      <div
        class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3"
      >
        <!-- 로고 + 데스크탑 메뉴 -->
        <div class="flex items-center gap-3">
          <!-- 로고 이미지 -->
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="SALCHO"
              class="h-8 w-auto object-contain
           dark:invert dark:brightness-200"
            />
          </RouterLink>

          <!-- 데스크탑용 네비 -->
          <nav
            class="hidden md:flex items-center gap-2 text-[12px] md:text-[13px]"
          >
            <RouterLink
              :to="{ name: 'home' }"
              class="rounded-t-md px-3 py-1.5 border border-transparent
                 hover:bg-slate-100 dark:hover:bg-slate-900/70
                 hover:text-black dark:hover:text-yellow-400 transition-colors"
              active-class="bg-slate-200 dark:bg-slate-900 text-black dark:text-yellow-400"
            >
              홈
            </RouterLink>
            <RouterLink
              v-if="$auth.profile?.role === 'master' || $auth.profile?.role === 'admin'"
              :to="{ name: 'new-post' }"
              class="rounded-t-md px-3 py-1.5
              hover:bg-slate-100 dark:hover:bg-slate-900/70
              hover:text-black dark:hover:text-yellow-400 transition-colors"
              active-class="bg-slate-200 dark:bg-slate-900 text-black dark:text-yellow-400"
            >
              글 작성
            </RouterLink>
            <RouterLink
                v-if="$auth.profile?.role === 'master'"
                :to="{ name: 'chat' }"
                class="rounded-t-md px-3 py-1.5
              hover:bg-slate-100 dark:hover:bg-slate-900/70
              hover:text-black dark:hover:text-yellow-400 transition-colors"
                active-class="bg-slate-200 dark:bg-slate-900 text-black dark:text-yellow-400"
            >
              채팅
            </RouterLink>
          </nav>
        </div>

        <!-- 우측: 다크 토글 + 로그인 + 모바일 메뉴 버튼 -->
        <div class="flex items-center gap-2">
          <!-- 다크 모드 토글 -->
          <button
            @click="isDark = !isDark"
            class="flex h-8 w-8 items-center justify-center rounded-md
               border border-slate-300 dark:border-slate-700
               bg-white dark:bg-slate-950 text-[15px]
               hover:border-black hover:text-black
               dark:hover:border-yellow-400 dark:hover:text-yellow-400
               transition-colors"
          >
            <span v-if="isDark">🌙</span>
            <span v-else>☀️</span>
          </button>

          <!-- 데스크탑: 유저 정보 -->
          <div
            v-if="auth.user"
            class="hidden md:flex items-center gap-2 text-[11px] md:text-[12px]"
          >
        <span
          class="max-w-[160px] truncate rounded
                 bg-slate-100 dark:bg-slate-900
                 px-2 py-1 border border-slate-300 dark:border-slate-700
                 text-slate-700 dark:text-slate-300"
        >
          {{ auth.user.email }}
        </span>
            <button
              @click="logout"
              class="rounded px-3 py-1.5 text-[11px] font-semibold
                 bg-black text-white hover:bg-slate-800
                 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300
                 transition-colors"
            >
              logout
            </button>
          </div>

          <div
            v-else
            class="hidden md:flex items-center gap-2 text-[11px] md:text-[12px]"
          >
            <RouterLink
              :to="{ name: 'login' }"
              class="rounded px-3 py-1.5
                 border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950
                 hover:border-black hover:text-black
                 dark:hover:border-yellow-400 dark:hover:text-yellow-400
                 transition-colors"
            >
              login
            </RouterLink>
            <RouterLink
              :to="{ name: 'signup' }"
              class="rounded px-3 py-1.5 font-semibold
                 bg-black text-white hover:bg-slate-800
                 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300
                 transition-colors"
            >
              sign up
            </RouterLink>
          </div>

          <!-- 모바일 메뉴 버튼 -->
          <button
            class="md:hidden flex h-8 w-8 items-center justify-center rounded-md
               border border-slate-300 dark:border-slate-700
               bg-white dark:bg-slate-950 text-[16px]"
            @click="showMobileMenu = !showMobileMenu"
          >
            <span v-if="showMobileMenu">✕</span>
            <span v-else>☰</span>
          </button>
        </div>
      </div>

      <!-- 모바일 드롭다운 메뉴 -->
      <div
        v-if="showMobileMenu"
        class="md:hidden border-t border-slate-200 dark:border-slate-800
           bg-white/98 dark:bg-slate-950/98"
      >
        <div class="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-1 text-[12px]">
          <RouterLink
            :to="{ name: 'home' }"
            class="px-2 py-1 rounded-md
               hover:bg-slate-100 dark:hover:bg-slate-900
               transition-colors"
            @click="showMobileMenu = false"
          >
            홈
          </RouterLink>

          <RouterLink
            v-if="$auth.profile?.role === 'admin'"
            :to="{ name: 'new-post' }"
            class="px-2 py-1 rounded-md
               hover:bg-slate-100 dark:hover:bg-slate-900
               transition-colors"
            @click="showMobileMenu = false"
          >
            글 작성
          </RouterLink>
          <div v-if="auth.user" class="flex items-center justify-between px-2 pt-1">
        <span class="text-slate-500 text-[11px] truncate">
          {{ auth.user.email }}
        </span>
            <button
              @click="
            logout();
            showMobileMenu = false;
          "
              class="text-[11px] px-2 py-1 rounded bg-black text-white
                 dark:bg-yellow-400 dark:text-black"
            >
              logout
            </button>
          </div>

          <div v-else class="flex gap-2 px-2 pt-1">
            <RouterLink
              :to="{ name: 'login' }"
              class="flex-1 text-center text-[11px] px-2 py-1 rounded
                 border border-slate-300 dark:border-slate-700
                 hover:border-black dark:hover:border-yellow-400"
              @click="showMobileMenu = false"
            >
              login
            </RouterLink>
            <RouterLink
              :to="{ name: 'signup' }"
              class="flex-1 text-center text-[11px] px-2 py-1 rounded
                 bg-black text-white
                 dark:bg-yellow-400 dark:text-black"
              @click="showMobileMenu = false"
            >
              sign up
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <!-- 메인 레이아웃 -->
    <div class="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4 md:flex-row">
      <!-- Explorer (카테고리 트리 + scroll-follow) -->
      <ExplorerSidebar
        :posts="posts"
        :active-post-id="activePostId"
        :loading="loadingPosts"
        :error="errorMsg"
        @open-post="openPost"
      />

      <!-- 오른쪽: RouterView -->
      <main
        class="flex-1 rounded-2xl
               border border-slate-200 dark:border-slate-800
               bg-white dark:bg-slate-950
               p-4 transition-colors duration-300"
      >
        <!-- 모바일 Explorer 선택 -->
        <div class="mb-3 md:hidden">
          <label class="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            select post
          </label>
          <select
            class="w-full rounded-md border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-950 px-2 py-1.5 text-[12px]"
            @change="handleMobileSelect"
          >
            <option value="">router-view.tsx (페이지 보기)</option>
            <option v-for="post in posts" :key="post.id" :value="post.id">
              {{ post.title || 'untitled.md' }}
            </option>
          </select>
        </div>

        <!-- 탭 바 -->
        <div
          class="mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800
                 pb-2 text-[10px] text-slate-500 dark:text-slate-600"
        >
          <div
            class="flex items-center gap-1 rounded-md
         bg-slate-100 dark:bg-slate-900
         px-2 py-1
         text-black dark:text-yellow-400"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-black dark:bg-yellow-400" />
            <span v-if="activePostMeta">
              {{ activePostMeta.title }}
              <span class="ml-2 text-[10px] text-slate-500 dark:text-slate-400">
                · {{ activePostMeta.author }} · {{ activePostMeta.category }} · {{ activePostMeta.createdAt }}
              </span>
            </span>
            <span v-else>router-view.tsx</span>
          </div>
          <div class="flex-1 text-right text-[9px]">
            Vue 3 · Firebase · Tailwind
          </div>
        </div>
        <div class="leading-relaxed">
          <RouterView />
        </div>
      </main>
    </div>

    <!-- 푸터 -->
    <footer
      class="mt-2 border-t border-slate-200 dark:border-slate-800
             bg-white/95 dark:bg-slate-950/95
             text-[10px] text-slate-500 dark:text-slate-600"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 gap-4">
        <div class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-black dark:bg-yellow-400" />
          <span>connected: salcho-blog</span>
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
