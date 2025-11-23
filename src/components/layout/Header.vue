<template>
  <header
    class="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl"
  >
    <div
      class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3"
    >
      <!-- 로고 + 데스크탑 메뉴 -->
      <div class="flex items-center gap-3">
        <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="SALCHO"
            class="h-8 w-auto object-contain dark:invert dark:brightness-200"
          />
        </RouterLink>

        <nav class="hidden md:flex items-center gap-2 text-[12px] md:text-[13px]">
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

      <!-- 우측: 테마 토글 + 유저 영역 + 모바일 버튼 -->
      <div class="flex items-center gap-2">
        <!-- 🔥 테마 토글: 부모에 이벤트만 쏨 -->
        <button
          @click="$emit('toggle-theme')"
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

        <!-- 로그인 상태 -->
        <div
          v-if="isLoggedIn"
          class="hidden md:flex items-center gap-2 text-[11px] md:text-[12px]"
        >
          <span
            class="max-w-[160px] truncate rounded
                 bg-slate-100 dark:bg-slate-900
                 px-2 py-1 border border-slate-300 dark:border-slate-700
                 text-slate-700 dark:text-slate-300"
          >
            {{ userEmail }}
          </span>
          <button
            @click="$emit('logout')"
            class="rounded px-3 py-1.5 text-[11px] font-semibold
                 bg-black text-white hover:bg-slate-800
                 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300
                 transition-colors"
          >
            logout
          </button>
        </div>

        <!-- 비로그인 상태 -->
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
          @click="$emit('toggle-mobile-menu')"
        >
          <span v-if="showMobileMenu">✕</span>
          <span v-else>☰</span>
        </button>
      </div>
    </div>

    <!-- 모바일 메뉴 (필요하면 따로 컴포넌트로 더 분리 가능) -->
    <div
      v-if="showMobileMenu"
      class="md:hidden border-t border-slate-200 dark:border-slate-800
           bg-white/98 dark:bg-slate-950/98"
    >
      <!-- TODO: 기존 모바일 메뉴 내용 옮겨오기 -->
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  isDark: boolean
  isLoggedIn: boolean
  userEmail?: string | null
  showMobileMenu: boolean
}>()

defineEmits<{
  (e: 'toggle-theme'): void
  (e: 'logout'): void
  (e: 'toggle-mobile-menu'): void
}>()
</script>
