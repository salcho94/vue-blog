<!-- src/components/layout/Header.vue -->
<template>
    <header
            class="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl"
    >
        <div
                class="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3"
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
                <!-- 테마 토글 -->
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

                <!-- 데스크탑: 로그인 상태 -->
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

                <!-- 데스크탑: 비로그인 상태 -->
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

        <!-- 모바일 메뉴 -->
        <div
                v-if="showMobileMenu"
                class="md:hidden border-t border-slate-200 dark:border-slate-800
           bg-white/98 dark:bg-slate-950/98"
        >
            <div class="mx-auto max-w-7xl px-4 py-2 flex flex-col gap-1 text-[12px]">
                <!-- 상단 네비 -->
                <RouterLink
                        :to="{ name: 'home' }"
                        class="px-2 py-1 rounded-md
                 hover:bg-slate-100 dark:hover:bg-slate-900
                 transition-colors"
                        @click="$emit('toggle-mobile-menu')"
                >
                    홈
                </RouterLink>

                <RouterLink
                        v-if="$auth.profile?.role === 'master' || $auth.profile?.role === 'admin'"
                        :to="{ name: 'new-post' }"
                        class="px-2 py-1 rounded-md
                 hover:bg-slate-100 dark:hover:bg-slate-900
                 transition-colors"
                        @click="$emit('toggle-mobile-menu')"
                >
                    글 작성
                </RouterLink>

                <RouterLink
                        v-if="$auth.profile?.role === 'master'"
                        :to="{ name: 'chat' }"
                        class="px-2 py-1 rounded-md
                 hover:bg-slate-100 dark:hover:bg-slate-900
                 transition-colors"
                        @click="$emit('toggle-mobile-menu')"
                >
                    채팅
                </RouterLink>

                <!-- 모바일: 로그인 상태 -->
                <div
                        v-if="isLoggedIn"
                        class="flex items-center justify-between px-2 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2"
                >
          <span class="text-slate-500 text-[11px] truncate">
            {{ userEmail }}
          </span>
                    <button
                            @click="
              $emit('logout');
              $emit('toggle-mobile-menu');
            "
                            class="text-[11px] px-2 py-1 rounded bg-black text-white
                   dark:bg-yellow-400 dark:text-black"
                    >
                        logout
                    </button>
                </div>

                <!-- 모바일: 비로그인 상태 -->
                <div
                        v-else
                        class="flex gap-2 px-2 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2"
                >
                    <RouterLink
                            :to="{ name: 'login' }"
                            class="flex-1 text-center text-[11px] px-2 py-1 rounded
                   border border-slate-300 dark:border-slate-700
                   hover:border-black dark:hover:border-yellow-400"
                            @click="$emit('toggle-mobile-menu')"
                    >
                        login
                    </RouterLink>
                    <RouterLink
                            :to="{ name: 'signup' }"
                            class="flex-1 text-center text-[11px] px-2 py-1 rounded
                   bg-black text-white
                   dark:bg-yellow-400 dark:text-black"
                            @click="$emit('toggle-mobile-menu')"
                    >
                        sign up
                    </RouterLink>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { defineProps, defineEmits } from 'vue'

defineProps<{
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
