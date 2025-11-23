<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import GlobalModal from '@/components/common/GlobalModal.vue'
import ExplorerSidebar from '@/components/layout/ExplorerSidebar.vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import TodayOverviewPanel from '@/components/layout/TodayOverviewPanel.vue'
import { logMainVisit } from '@/utils/common'
import { useTheme } from '@/composables/useTheme'
import { useExplorerPosts } from '@/composables/useExplorerPosts'
import type { Post } from '@/types/post'
import { useVisitStats } from '@/composables/useVisitStats'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

// 테마
const { isDark, toggleTheme } = useTheme()

const {
    todayVisitors,
    yesterdayVisitors,
    loading: visitLoading,
    error: visitError,
    load: loadVisitStats,
} = useVisitStats()

// Explorer + 포스트
const {
    posts,
    loadingPosts,
    errorMsg,
    activePostId,
    activePostMeta,
    openPost,
    handleMobileSelect,
} = useExplorerPosts({ router, route })

// 모바일 메뉴
const showMobileMenu = ref(false)

const logout = async () => {
    await auth.logout()
    router.push({ name: 'home' })
}

onMounted(async () => {
    try {
        await logMainVisit()     // 1) 오늘 방문자 기록
    } catch (e) {
        console.error(e)
    }

    await loadVisitStats()     // 2) 통계 조회

    auth.init?.()
})

const topTodayPosts = computed<Post[]>(() => {
    return [...posts.value]
        .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        .slice(0, 3)
})
</script>

<template>
    <GlobalModal />
    <div
            class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-[system-ui] text-[14px] md:text-[15px] transition-colors duration-300"
    >
        <!-- 헤더 -->
        <Header
                :is-dark="isDark"
                :is-logged-in="!!auth.user"
                :user-email="auth.user?.email ?? ''"
                :show-mobile-menu="showMobileMenu"
                @toggle-theme="toggleTheme"
                @logout="logout"
                @toggle-mobile-menu="showMobileMenu = !showMobileMenu"
        />

        <!-- 메인 레이아웃 -->
        <div class="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-4 md:flex-row">
            <!-- 좌측 Explorer -->
            <ExplorerSidebar
                    :posts="posts"
                    :active-post-id="activePostId"
                    :loading="loadingPosts"
                    :error="errorMsg"
                    @open-post="openPost"
            />

            <!-- 중앙 메인 -->
            <main
                    class="flex-1 rounded-2xl
               border border-slate-200 dark:border-slate-800
               bg-white dark:bg-slate-950
               p-4 transition-colors duration-300"
            >
                <!-- 모바일 select -->
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

                <!-- 상단 탭 -->
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
                · {{ activePostMeta.author }} · {{ activePostMeta.category }} ·
                {{ activePostMeta.createdAt }}
              </span>
            </span>
                        <span v-else>router-view.tsx</span>
                    </div>
                    <div class="flex-1 text-right text-[9px]">
                        Vue 3 · Firebase · Tailwind · Developer
                    </div>
                </div>

                <!-- 페이지 내용 -->
                <div class="leading-relaxed">
                    <RouterView />
                </div>
            </main>

            <TodayOverviewPanel
                    :today-visitors="todayVisitors"
                    :yesterday-visitors="yesterdayVisitors"
                    :top-today-posts="topTodayPosts"
                    @open-post="openPost"
            />
        </div>

        <!-- 푸터 -->
        <Footer />
    </div>
</template>
