<!-- src/pages/posts/PostCreatePage.vue -->
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { createPost } from '@/services/posts'
import { uploadImage } from '@/services/upload'
import MarkdownIt from 'markdown-it'
import { useModalStore } from '@/stores/modal.store' // ✅ 전역 모달 스토어

const auth = useAuthStore()
const router = useRouter()
const modal = useModalStore()

const categories = ['Java', 'TypeScript/JavaScript', 'React', 'Vue', 'GitHub', 'Other', '여행'] as const
type Category = (typeof categories)[number]
const category = ref<Category>('Java')

const title = ref('')
const summary = ref('')
const content = ref('')
const tags = ref('')
const loading = ref(false)
const errorMsg = ref('')

const fileInputRef = ref<HTMLInputElement | null>(null)
// ✅ 커서 위치용 textarea ref
const contentTextareaRef = ref<HTMLTextAreaElement | null>(null)

// markdown-it 인스턴스
const md = new MarkdownIt({
  breaks: true,
})

// 미리보기 관련 상태
const previewHtml = ref('')
const previewOpen = ref(true)

// 미리보기 수동 업데이트
const updatePreview = () => {
  previewHtml.value = md.render(content.value)
}

// ✅ 본문에 "현재 커서 위치" 기준으로 이미지 마크다운 추가
const insertImageToContent = (url: string) => {
  const current = content.value || ''
  const mdImage = `\n\n![image](${url})\n`
  const textarea = contentTextareaRef.value

  if (textarea) {
    const start = textarea.selectionStart ?? current.length
    const end = textarea.selectionEnd ?? start

    content.value = current.slice(0, start) + mdImage + current.slice(end)

    nextTick(() => {
      const pos = start + mdImage.length
      textarea.selectionStart = textarea.selectionEnd = pos
    })
  } else {
    // ref 못 잡혔으면 그냥 뒤에 붙이기
    content.value = current + mdImage
  }

  updatePreview()
}

// 공통 이미지 업로드 + 본문 삽입 함수
const uploadAndInsertImage = async (file: File) => {
  try {
    loading.value = true
    errorMsg.value = ''
    const url = await uploadImage(file) // 백엔드 업로드 후 절대 URL 반환
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
    loading.value = false
  }
}

// "이미지 추가" 버튼 → 파일 선택창
const handleSelectImage = () => {
  fileInputRef.value?.click()
}

// 파일 선택 후 업로드
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
  if (!imageItem) return // 이미지가 없으면 기본 텍스트 붙여넣기 유지

  const file = imageItem.getAsFile()
  if (!file) return

  // 기본 붙여넣기 막고 우리가 처리
  e.preventDefault()

  await uploadAndInsertImage(file)
}

const submit = async () => {
  // 🔒 유효성 검증을 모달로 처리
  if (!auth.user) {
    modal.alert({
      title: '로그인 필요',
      message: '로그인 후 글을 작성할 수 있습니다.',
      type: 'info',
    })
    return
  }

  const titleTrim = title.value.trim()
  const contentTrim = content.value.trim()

  if (!titleTrim || !contentTrim) {
    modal.alert({
      title: '작성 오류',
      message: '제목과 내용을 모두 입력하세요.',
      type: 'error',
    })
    return
  }

  if (!category.value) {
    modal.alert({
      title: '카테고리 선택',
      message: '카테고리를 선택해주세요.',
      type: 'error',
    })
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const id = await createPost({
      title: titleTrim,
      summary: summary.value.trim(),
      content: contentTrim, // 마크다운 + 이미지 URL 포함
      tags: tags.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),

      category: category.value,

      authorId: auth.user.uid,
      authorName: auth.user.email || 'user',
      isPublished: true,
    })
    // ✅ Explorer 새로고침 트리거
    window.dispatchEvent(new CustomEvent('posts-updated'))
    await router.push(`/posts/${id}`)
  } catch (e: any) {
    const msg = e?.message || '등록 실패'
    errorMsg.value = msg
    modal.alert({
      title: '등록 실패',
      message: msg,
      type: 'error',
    })
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

    <!-- ✅ 카테고리 선택 -->
    <div class="flex items-center gap-2">
      <span class="text-[11px] text-slate-500 dark:text-slate-300">
        카테고리
      </span>
      <select
        v-model="category"
        class="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-[11px]"
      >
        <option
          v-for="c in categories"
          :key="c"
          :value="c"
        >
          {{ c }}
        </option>
      </select>
    </div>

    <!-- 입력 영역만 글자 작게 -->
    <div class="space-y-2 text-[11px]">
      <input
        v-model="title"
        placeholder="제목"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />

      <input
        v-model="summary"
        placeholder="요약 (선택)"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />

      <input
        v-model="tags"
        placeholder="태그 (쉼표로 구분)"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleSelectImage"
          class="px-3 py-1.5 rounded-md border border-slate-300 text-[11px]
                 text-slate-700 dark:text-slate-200 dark:border-slate-600
                 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          이미지 추가
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

      <textarea
        ref="contentTextareaRef"
        v-model="content"
        rows="10"
        placeholder="내용 (마크다운 지원, 예: # 제목)"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-2 font-mono"
        @paste="handlePaste"
      />
    </div>

    <!-- 미리보기 -->
    <div
      class="mt-1 border border-slate-200 dark:border-slate-700 rounded-md p-3 bg-white dark:bg-slate-900"
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

    <button
      @click="submit"
      :disabled="loading"
      class="px-4 py-2 rounded-md text-[12px] font-semibold
             bg-black text-white hover:bg-slate-800
             disabled:opacity-60
             dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
    >
      {{ loading ? '처리 중...' : '게시' }}
    </button>

    <p
      v-if="errorMsg"
      class="text-[10px] text-red-400"
    >
      {{ errorMsg }}
    </p>
  </div>
</template>
