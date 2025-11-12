<!-- src/pages/TagPage.vue -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getPostsByTag } from '@/services/posts'
import type { Post } from '@/types/post'

const route = useRoute()
const posts = ref<Post[]>([])
const loading = ref(true)
const tag = ref<string>('')

async function load() {
  loading.value = true
  tag.value = String(route.params.tag || '')
  posts.value = tag.value ? await getPostsByTag(tag.value) : []
  loading.value = false
}

watch(() => route.params.tag, load, { immediate: true })
</script>

<template>
  <section>
    <h1 class="mb-4 text-xl font-semibold">
      #{{ tag }} <span class="text-sm text-slate-500">({{ posts.length }})</span>
    </h1>

    <div v-if="loading" class="text-sm text-slate-500">loading…</div>

    <ul v-else class="grid gap-3 md:grid-cols-2">
      <li v-for="p in posts" :key="p.id"
          class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 hover:border-black dark:hover:border-yellow-400 transition">
        <RouterLink :to="{ name:'post-detail', params:{ id: p.id } }" class="block">
          <h3 class="text-base font-semibold mb-1">{{ p.title }}</h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {{ p.summary || (p.content || '').slice(0,140) }}
          </p>
          <div class="mt-2 flex flex-wrap gap-1">
            <RouterLink v-for="t in (p.tags || [])" :key="t"
                        :to="{ name:'tag-view', params:{ tag: t } }"
                        class="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200">
              #{{ t }}
            </RouterLink>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
