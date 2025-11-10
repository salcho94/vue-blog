<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAllPublishedPosts } from '@/services/posts'
import type { Post } from '@/types/post'
import { RouterLink } from 'vue-router'

const posts = ref<Post[]>([])
const loading = ref(false)
const errorMsg = ref('')
const search = ref('')

onMounted(async () => {
  loading.value = true
  try {
    posts.value = await getAllPublishedPosts()
  } catch (e: any) {
    errorMsg.value = e.message || '불러오기 실패'
  } finally {
    loading.value = false
  }
})

const filtered = computed(() =>
  posts.value.filter((p) =>
    (p.title || '').toLowerCase().includes(search.value.toLowerCase()),
  ),
)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        posts.ts
      </h1>
      <input
        v-model="search"
        placeholder="검색..."
        class="w-40 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200"
      />
    </div>

    <div v-if="loading" class="text-xs text-slate-500">loading...</div>
    <div v-else-if="errorMsg" class="text-xs text-red-400">
      {{ errorMsg }}
    </div>
    <div v-else-if="!filtered.length" class="text-xs text-slate-500">
      글이 없습니다.
    </div>

    <ul class="space-y-2">
      <li
        v-for="post in filtered"
        :key="post.id"
        class="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 flex flex-col gap-1"
      >
        <RouterLink
          :to="`/posts/${post.id}`"
          class="text-sm text-slate-900 dark:text-slate-100 font-medium hover:text-cyan-400"
        >
          {{ post.title }}
        </RouterLink>
        <p class="text-[10px] text-slate-500">
          {{ post.summary || (post.content || '').slice(0, 80) + '...' }}
        </p>
        <div class="flex items-center gap-3 text-[9px] text-slate-500">
          <span>{{ post.views ?? 0 }} views</span>
          <span>{{ post.likes ?? 0 }} likes</span>
        </div>
      </li>
    </ul>
  </div>
</template>
