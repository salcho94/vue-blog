<!-- src/components/layout/TodayOverviewPanel.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '@/types/post'

const props = defineProps<{
  todayVisitors: number
  yesterdayVisitors: number
  topTodayPosts: Post[]
}>()

const diff = computed(() => props.todayVisitors - props.yesterdayVisitors)

// ✅ 클릭 시 상위로 포스트 전달
const emit = defineEmits<{
  (e: 'open-post', post: Post): void
}>()
</script>

<template>
  <aside
      class="hidden 2xl:block w-64 shrink-0
           sticky top-20 self-start
           max-h-[calc(100vh-6rem)]"
  >
    <div
        class="rounded-2xl border border-slate-200 dark:border-slate-800
             bg-white dark:bg-slate-950 p-3 text-[11px]
             overflow-y-auto"
    >
      <p class="text-[10px] uppercase tracking-[0.14em] mb-2">
        today overview
      </p>

      <div class="mb-2">
        <p class="text-[10px] text-slate-500">오늘 방문자</p>
        <p class="text-2xl font-semibold">{{ todayVisitors }}</p>
        <p class="text-[10px] text-slate-400">
          어제 {{ yesterdayVisitors }}명
          <span :class="diff >= 0 ? 'text-emerald-500' : 'text-red-400'">
            ({{ diff >= 0 ? '+' : '' }}{{ diff }})
          </span>
        </p>
      </div>

      <div class="mt-3 border-t border-slate-200 dark:border-slate-800 pt-2">
        <p class="text-[10px] text-slate-500 mb-1">Most View</p>
        <ul class="space-y-1">
          <li
              v-for="post in topTodayPosts"
              :key="post.id"
          >
            <button
                type="button"
                class="flex w-full justify-between text-[10px]
                     rounded px-1.5 py-1 text-left
                     hover:bg-slate-100 hover:text-black
                     dark:hover:bg-slate-900 dark:hover:text-yellow-300
                     transition-colors"
                @click="emit('open-post', post)"
            >
              <span class="truncate max-w-[120px]">
                {{ post.title || 'untitled.md' }}
              </span>
              <span class="text-slate-400">{{ post.views ?? 0 }}v</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>
