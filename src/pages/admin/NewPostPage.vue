<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { createPost } from '@/services/posts'

const auth = useAuthStore()
const router = useRouter()

const title = ref('')
const summary = ref('')
const content = ref('')
const tags = ref('')
const loading = ref(false)
const errorMsg = ref('')

const submit = async () => {
  if (!auth.user) {
    errorMsg.value = '로그인이 필요합니다.'
    return
  }
  if (!title.value.trim() || !content.value.trim()) {
    errorMsg.value = '제목과 내용을 입력하세요.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const id = await createPost({
      title: title.value.trim(),
      summary: summary.value.trim(),
      content: content.value.trim(),
      tags: tags.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      authorId: auth.user.uid,
      authorName: auth.user.email || 'user',
      isPublished: true,
    })
    location.href = `/posts/${id}`
  } catch (e: any) {
    errorMsg.value = e.message || '등록 실패'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-3">
    <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
      글 작성
    </h1>

    <div class="space-y-2 text-[11px]">
      <input
        v-model="title"
        placeholder="제목"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />
<!--      <input-->
<!--        v-model="summary"-->
<!--        placeholder="요약 (선택)"-->
<!--        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"-->
<!--      />-->
<!--      <input-->
<!--        v-model="tags"-->
<!--        placeholder="태그 (쉼표로 구분)"-->
<!--        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"-->
<!--      />-->
      <textarea
        v-model="content"
        rows="10"
        placeholder="내용"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-2 font-mono"
      />
      <button
        @click="submit"
        :disabled="loading"
        class="px-4 py-1.5 rounded-md bg-cyan-400 text-slate-950 text-[11px] font-semibold hover:bg-cyan-300 disabled:opacity-60"
      >
        게시
      </button>
      <p v-if="errorMsg" class="text-[10px] text-red-400">
        {{ errorMsg }}
      </p>
    </div>
  </div>
</template>
