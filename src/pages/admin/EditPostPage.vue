<!-- src/pages/admin/EditPostPage.vue -->
<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPost, updatePost } from '@/services/posts'
import type { Post, Category } from '@/types/post'
import { useAuthStore } from '@/stores/auth.store'
import { uploadImage } from '@/services/upload'
import MarkdownIt from 'markdown-it'
import { useModalStore } from '@/stores/modal.store' // ✅ 전역 모달

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const modal = useModalStore()

const id = route.params.id as string

const original = ref<Post | null>(null)  // 원본 보관
const post = ref<Post | null>(null)      // 편집본
const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')

// ✅ 카테고리 목록 (개발 언어 + 여행)
const categories: Category[] = ['Java', 'TypeScript', 'JavaScript', 'React', 'Vue', 'Other', '여행']

// ---- 이미지 업로드/미리보기 관련 ----
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageUploading = ref(false)

// ✏️ 본문 textarea DOM 참조 (커서 위치 넣기용)
const contentTextareaRef = ref<HTMLTextAreaElement | null>(null)

// markdown-it 인스턴스 + 미리보기 HTML
const md = new MarkdownIt({
  breaks: true,
})

const previewHtml = ref('')
const previewOpen = ref(true)

const updatePreview = () => {
  previewHtml.value = md.render(post.value?.content || '')
}

// ✅ 커서 위치에 이미지 마크다운 삽입
const insertImageToContent = (url: string) => {
  if (!post.value) return

  const textarea = contentTextareaRef.value
  const current = post.value.content || ''
  const mdImage = `\n\n![image](${url})\n`

  if (textarea) {
    const start = textarea.selectionStart ?? current.length
    const end = textarea.selectionEnd ?? start

    post.value.content =
      current.slice(0, start) + mdImage + current.slice(end)

    // 커서 위치를 이미지 뒤로 이동
    nextTick(() => {
      const pos = start + mdImage.length
      textarea.selectionStart = textarea.selectionEnd = pos
    })
  } else {
    // textarea ref 못 잡으면 그냥 뒤에 붙이기
    post.value.content = current + mdImage
  }

  updatePreview()
}

// 공통 이미지 업로드 + 본문 삽입 함수
const uploadAndInsertImage = async (file: File) => {
  try {
    imageUploading.value = true
    errorMsg.value = ''
    const url = await uploadImage(file) // /blog/upload 호출
    insertImageToContent(url)
  } catch (err: any) {
    const msg = err?.message || '이미지 업로드 실패'
    errorMsg.value = msg
    modal.alert({
      title: '이미지 업로드 오류',
      message: msg,
      type: 'error',
    })
  } finally {
    imageUploading.value = false
  }
}

const handleSelectImage = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  await uploadAndInsertImage(file)
  target.value = ''
}

// 📌 캡쳐 후 붙여넣기 시 이미지 업로드
const handlePaste = async (e: ClipboardEvent) => {
  const clipboardData = e.clipboardData
  if (!clipboardData) return

  const items = Array.from(clipboardData.items)
  const imageItem = items.find((item) => item.type.startsWith('image/'))
  if (!imageItem) return // 이미지 없으면 기본 텍스트 붙여넣기

  const file = imageItem.getAsFile()
  if (!file) return

  // 기본 붙여넣기 막고 우리가 처리
  e.preventDefault()

  await uploadAndInsertImage(file)
}

// ---- 태그 에디터 상태 ----
const tagInput = ref('')

function addTagFromInput() {
  const raw = tagInput.value.trim()
  if (!raw || !post.value) return
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((t) => {
      if (!post.value!.tags) post.value!.tags = []
      if (!post.value!.tags!.includes(t)) post.value!.tags!.push(t)
    })
  tagInput.value = ''
}

function removeTag(t: string) {
  if (!post.value?.tags) return
  post.value.tags = post.value.tags.filter((x) => x !== t)
}

// ---- 변경사항 비교 ----
const changes = computed(() => {
  if (!original.value || !post.value) return []
  const diffs: Array<{ field: string; before: any; after: any }> = []
  const cmp = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b)

  if (cmp(original.value.title || '', post.value.title || ''))
    diffs.push({
      field: '제목',
      before: original.value.title || '',
      after: post.value.title || '',
    })

  if (cmp(original.value.summary || '', post.value.summary || ''))
    diffs.push({
      field: '요약',
      before: original.value.summary || '',
      after: post.value.summary || '',
    })

  // ✅ 카테고리 변경
  if (cmp(original.value.category || '', post.value.category || ''))
    diffs.push({
      field: '카테고리',
      before: original.value.category || '',
      after: post.value.category || '',
    })

  if (cmp(original.value.content || '', post.value.content || ''))
    diffs.push({ field: '본문', before: '…', after: '…' }) // 본문은 길어지니 표시는 생략

  if (cmp(original.value.tags || [], post.value.tags || []))
    diffs.push({
      field: '태그',
      before: original.value.tags || [],
      after: post.value.tags || [],
    })

  if (cmp(!!original.value.isPublished, !!post.value.isPublished))
    diffs.push({
      field: '공개 여부',
      before: !!original.value.isPublished,
      after: !!post.value.isPublished,
    })

  return diffs
})

onMounted(async () => {
  try {
    const data = await getPost(id)
    if (!data) {
      const msg = '포스트를 찾을 수 없습니다.'
      errorMsg.value = msg
      modal.alert({
        title: '불러오기 오류',
        message: msg,
        type: 'error',
      })
      return
    }
    if (!auth.user || auth.user.uid !== data.authorId) {
      const msg = '수정 권한이 없습니다.'
      errorMsg.value = msg
      modal.alert({
        title: '권한 오류',
        message: msg,
        type: 'error',
      })
      return
    }

    original.value = JSON.parse(JSON.stringify(data)) as Post
    // 편집본 초기화 (깊은복사)
    post.value = JSON.parse(JSON.stringify(data)) as Post
    if (!post.value.tags) post.value.tags = []

    // ✅ 기존 포스트에 category가 없으면 기본값 세팅
    if (!post.value.category) {
      post.value.category = 'Java'
    }

    // 최초 미리보기 생성
    updatePreview()
  } catch (e: any) {
    const msg = e?.message || '불러오기 실패'
    errorMsg.value = msg
    modal.alert({
      title: '불러오기 오류',
      message: msg,
      type: 'error',
    })
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!post.value) return

  // 🔒 유효성 체크 → 모달
  const titleTrim = post.value.title?.trim() || ''
  const contentTrim = post.value.content?.trim() || ''
  if (!titleTrim || !contentTrim) {
    modal.alert({
      title: '작성 오류',
      message: '제목과 내용을 모두 입력하세요.',
      type: 'error',
    })
    return
  }

  if (!post.value.category) {
    modal.alert({
      title: '카테고리 선택',
      message: '카테고리를 선택해주세요.',
      type: 'error',
    })
    return
  }

  saving.value = true
  errorMsg.value = ''
  try {
    await updatePost(id, {
      title: titleTrim,
      summary: post.value.summary?.trim() || '',
      content: post.value.content,
      tags: (post.value.tags || []).map((t) => t.trim()).filter(Boolean),
      category: post.value.category as Category,
      isPublished: !!post.value.isPublished,
    })
    window.dispatchEvent(new CustomEvent('posts-updated'))
    modal.alert({
      title: '저장 완료',
      message: '글이 성공적으로 수정되었습니다.',
      type: 'success',
    })
    router.push({ name: 'post-detail', params: { id } })
  } catch (e: any) {
    const msg = e?.message || '수정 실패'
    errorMsg.value = msg
    modal.alert({
      title: '수정 실패',
      message: msg,
      type: 'error',
    })
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

      <!-- ✅ 카테고리 선택 -->
      <label class="grid gap-1">
        <span class="text-slate-500">카테고리</span>
        <select
          v-model="post.category"
          class="w-full max-w-xs rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950 px-3 py-2 text-[13px]"
        >
          <option
            v-for="c in categories"
            :key="c"
            :value="c"
          >
            {{ c }}
          </option>
        </select>
      </label>

      <!-- 본문 + 이미지 업로드 + 미리보기 -->
      <label class="grid gap-1">
        <span class="text-slate-500">본문</span>

        <!-- 이미지 추가 버튼 -->
        <div class="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            @click="handleSelectImage"
            :disabled="imageUploading"
            class="px-3 py-1.5 rounded-md border border-slate-300
                   text-slate-700 dark:text-slate-200 dark:border-slate-600
                   hover:bg-slate-100 dark:hover:bg-slate-800
                   disabled:opacity-60"
          >
            {{ imageUploading ? '이미지 업로드 중…' : '이미지 추가' }}
          </button>
          <span class="text-[10px] text-slate-400">
            업로드하면 본문에 이미지 마크다운이 자동으로 추가됩니다.
          </span>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
        </div>

        <!-- 내용 입력 -->
        <textarea
          ref="contentTextareaRef"
          v-model="post.content"
          rows="12"
          placeholder="내용을 입력하세요 (마크다운 지원, 예: # 제목)"
          class="w-full rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950 px-3 py-3 font-mono text-[12px]"
          @paste="handlePaste"
        />

        <!-- 미리보기 -->
        <div
          class="mt-2 border border-slate-200 dark:border-slate-700 rounded-md p-3 bg-white dark:bg-slate-900"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-[10px] text-slate-400">
              미리보기
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="updatePreview"
                class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-[10px]
                       hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                새로고침
              </button>
              <button
                type="button"
                @click="previewOpen = !previewOpen"
                class="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-[10px]
                       hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {{ previewOpen ? '접기' : '열기' }}
              </button>
            </div>
          </div>

          <div
            v-show="previewOpen"
            class="prose prose-sm max-w-none dark:prose-invert"
            v-html="previewHtml"
          />
        </div>
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
            >
              ✕
            </button>
          </span>
        </div>
        <input
          v-model="tagInput"
          @keydown.enter.prevent="addTagFromInput"
          @keyup.enter.prevent="addTagFromInput"
          placeholder="엔터/콤마로 추가 (예: Vue, Firebase)"
          class="w-full rounded-md border border-slate-300 dark:border-slate-700
                 bg-white dark:bg-slate-950 px-3 py-2 text-[13px]"
          @input="(e: any) => { if (e.data === ',') addTagFromInput() }"
        />
        <p class="text-[11px] text-slate-400">
          예시: <code>Vue, Firebase, Tailwind</code>
        </p>
      </div>

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
              :
              {{ (c.before as string[]).join(', ') || '없음' }}
              →
              {{ (c.after as string[]).join(', ') || '없음' }}
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
          :disabled="saving"
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
