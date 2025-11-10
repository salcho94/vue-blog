<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAllPublishedPosts } from '@/services/posts'
import type { Post } from '@/types/post'
import { RouterLink } from 'vue-router'

const posts = ref<Post[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    posts.value = await getAllPublishedPosts()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        salcho.dev <span class="text-cyan-400">/ blog</span>
      </h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        코드, 기록, 생각들을 IDE 스타일로 정리한 개인 블로그.
      </p>
    </section>

    <section>
      <h2 class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
        latest posts
      </h2>
      <div v-if="loading" class="text-xs text-slate-500">loading...</div>
      <div v-else-if="!posts.length" class="text-xs text-slate-500">
        아직 작성된 글이 없습니다.
      </div>
      <ul class="space-y-2">
        <li
          v-for="post in posts.slice(0, 5)"
          :key="post.id"
          class="flex items-center justify-between text-xs"
        >
          <RouterLink
            :to="`/posts/${post.id}`"
            class="text-slate-800 dark:text-slate-200 hover:text-cyan-400"
          >
            {{ post.title }}
          </RouterLink>
          <span class="text-[10px] text-slate-500">
            {{ post.views ?? 0 }} views
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>
