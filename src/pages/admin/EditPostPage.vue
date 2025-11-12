<!-- src/pages/admin/EditPostPage.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, updatePost } from '@/services/posts'
import type { Post } from '@/types/post'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = route.params.id as string

const original = ref<Post | null>(null)  // 원본 보관
const post = ref<Post | null>(null)      // 편집본
const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')

// ---- 태그 에디터 상태 ----
const tagInput = ref('')

function addTagFromInput() {
  const raw = tagInput.value.trim()
  if (!raw || !post.value) return
  raw.split(',').map(s => s.trim()).filter(Boolean).forEach(t => {
    if (!post.value!.tags) post.value!.tags = []
    if (!post.value!.tags!.includes(t)) post.value!.tags!.push(t)
  })
  tagInput.value = ''
}

function removeTag(t: string) {
  if (!post.value?.tags) return
  post.value.tags = post.value.tags.filter(x => x !== t)
}

// ---- 변경사항 비교 ----
const changes = computed(() => {
  if (!original.value || !post.value) return []
  const diffs: Array<{ field: string; before: any; after: any }> = []
  const cmp = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b)

  if (cmp(original.value.title || '', post.value.title || ''))
    diffs.push({ field: '제목', before: original.value.title || '', after: post.value.title || '' })

  if (cmp(original.value.summary || '', post.value.summary || ''))
    diffs.push({ field: '요약', before: original.value.summary || '', after: post.value.summary || '' })

  if (cmp(original.value.content || '', post.value.content || ''))
    diffs.push({ field: '본문', before: '…', after: '…' }) // 본문은 길어지니 표시는 생략

  if (cmp(original.value.tags || [], post.value.tags || []))
    diffs.push({ field: '태그', before: original.value.tags || [], after: post.value.tags || [] })

  if (cmp(!!original.value.isPublished, !!post.value.isPublished))
    diffs.push({ field: '공개 여부', before: !!original.value.isPublished, after: !!post.value.isPublished })

  return diffs
})

const canSave = computed(() =>
  !!post.value &&
  !!(post.value.title && post.value.title.trim()) &&
  !!(post.value.content && post.value.content.trim())
)

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
    original.value = JSON.parse(JSON.stringify(data)) as Post
    // 편집본 초기화 (깊은복사)
    post.value = JSON.parse(JSON.stringify(data)) as Post
    if (!post.value.tags) post.value.tags = []
  } catch (e: any) {
    errorMsg.value = e.message || '불러오기 실패'
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!post.value || !canSave.value) return
  saving.value = true
  errorMsg.value = ''
  try {
    await updatePost(id, {
      title: post.value.title?.trim(),
      summary: post.value.summary?.trim() || '',
      content: post.value.content,
      tags: (post.value.tags || []).map(t => t.trim()).filter(Boolean),
      isPublished: !!post.value.isPublished,
    })
    router.push({ name: 'post-detail', params: { id } })
  } catch (e: any) {
    errorMsg.value = e.message || '수정 실패'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
      글 수정
    </h1>

    <div v-if="loading" class="text-xs text-slate-500">loading...</div>
    <div v-else-if="errorMsg" class="text-xs text-red-400">{{ errorMsg }}</div>

    <div v-else-if="post" class="grid gap-3 text-[12px]">
      <!-- 제목 -->
      <label class="grid gap-1">
        <span class="text-slate-500">제목</span>
        <input
          v-model="post.title"
          placeholder="제목을 입력하세요"
          class="w-full rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950 px-3 py-2 text-[13px]"
        />
      </label>

      <!-- 요약 -->
      <label class="grid gap-1">
        <span class="text-slate-500">요약</span>
        <input
          v-model="post.summary"
          placeholder="요약(메타/리스트 미리보기)"
          class="w-full rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950 px-3 py-2 text-[13px]"
        />
      </label>

      <!-- 본문 -->
      <label class="grid gap-1">
        <span class="text-slate-500">본문</span>
        <textarea
          v-model="post.content"
          rows="12"
          placeholder="내용을 입력하세요"
          class="w-full rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950 px-3 py-3 font-mono text-[12px]"
        />
      </label>

      <!-- 태그 -->
      <div class="grid gap-2">
        <span class="text-slate-500">태그</span>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="t in post.tags"
            :key="t"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md
                   bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[11px]"
          >
            #{{ t }}
            <button
              class="ml-1 text-slate-500 hover:text-red-500"
              @click="removeTag(t)"
              title="remove"
            >✕</button>
          </span>
        </div>
        <input
          v-model="tagInput"
          @keydown.enter.prevent="addTagFromInput"
          @keyup.enter.prevent="addTagFromInput"
          placeholder="엔터/콤마로 추가 (예: Vue, Firebase)"
          class="w-full rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950 px-3 py-2 text-[13px]"
          @input="(e:any)=>{ if (e.data === ',') addTagFromInput() }"
        />
        <p class="text-[11px] text-slate-400">예시: <code>Vue, Firebase, Tailwind</code></p>
      </div>

<!--      &lt;!&ndash; 공개 여부 &ndash;&gt;-->
<!--      <label class="inline-flex items-center gap-2 mt-2">-->
<!--        <input type="checkbox" v-model="post.isPublished" />-->
<!--        <span class="text-slate-600 dark:text-slate-300">공개</span>-->
<!--      </label>-->

      <!-- 변경 사항 요약 -->
      <div
        v-if="changes.length"
        class="rounded-md border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50"
      >
        <div class="text-[12px] font-medium mb-1">변경사항</div>
        <ul class="list-disc pl-5 space-y-0.5 text-[11px]">
          <li v-for="c in changes" :key="c.field">
            <strong>{{ c.field }}</strong>
            <template v-if="c.field !== '본문' && c.field !== '태그'">
              : “{{ c.before }}” → “{{ c.after }}”
            </template>
            <template v-else-if="c.field === '태그'">
              : {{ (c.before as string[]).join(', ') || '없음' }} → {{ (c.after as string[]).join(', ') || '없음' }}
            </template>
            <template v-else>
              (내용 변경)
            </template>
          </li>
        </ul>
      </div>

      <!-- 액션 -->
      <div class="flex items-center gap-2 pt-1">
        <button
          @click="save"
          :disabled="saving || !canSave"
          class="px-4 py-2 rounded-md text-[12px] font-semibold
                 bg-black text-white hover:bg-slate-800
                 disabled:opacity-60
                 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
        >
          {{ saving ? '저장 중…' : '저장' }}
        </button>
        <button
          type="button"
          class="px-3 py-2 rounded-md text-[12px] border
                 border-slate-300 dark:border-slate-700"
          @click="router.back()"
        >
          취소
        </button>
      </div>
    </div>
  </div>
</template>
