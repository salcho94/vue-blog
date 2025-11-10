<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, updatePost } from '@/services/posts'
import type { Post } from '@/types/post'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const post = ref<Post | null>(null)
const loading = ref(true)
const errorMsg = ref('')

const id = route.params.id as string

onMounted(async () => {
  try {
    const data = await getPost(id)
    if (!data) {
      errorMsg.value = '포스트를 찾을 수 없습니다.'
      return
    }
    if (!auth.user || auth.user.uid !== data.authorId) {
      errorMsg.value = '수정 권한이 없습니다.'
      return
    }
    post.value = data
  } catch (e: any) {
    errorMsg.value = e.message || '불러오기 실패'
  } finally {
    loading.value = false
  }
})

const save = async () => {
  if (!post.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    await updatePost(id, {
      title: post.value.title,
      summary: post.value.summary,
      content: post.value.content,
      tags: post.value.tags || [],
    })
    router.push(`/posts/${id}`)
  } catch (e: any) {
    errorMsg.value = e.message || '수정 실패'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-3">
    <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
      edit post
    </h1>

    <div v-if="loading" class="text-xs text-slate-500">loading...</div>
    <div v-else-if="errorMsg" class="text-xs text-red-400">{{ errorMsg }}</div>
    <div v-else-if="post" class="space-y-2 text-[11px]">
      <input
        v-model="post.title"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />
      <input
        v-model="post.summary"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />
      <textarea
        v-model="post.content"
        rows="10"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-2 font-mono"
      />
      <button
        @click="save"
        :disabled="loading"
        class="px-4 py-1.5 rounded-md bg-cyan-400 text-slate-950 text-[11px] font-semibold hover:bg-cyan-300 disabled:opacity-60"
      >
        저장
      </button>
    </div>
  </div>
</template>
