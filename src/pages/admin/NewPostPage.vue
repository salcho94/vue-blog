<!-- src/pages/posts/PostCreatePage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { createPost } from '@/services/posts'
import { uploadImage } from '@/services/upload'
import MarkdownIt from 'markdown-it'
import { useModalStore } from '@/stores/modal.store' // ✅ 전역 모달 스토어

const auth = useAuthStore()
const router = useRouter()
const modal = useModalStore()

const title = ref('')
const summary = ref('')
const content = ref('')
const tags = ref('')
const loading = ref(false)
const errorMsg = ref('') // 혹시 콘솔/하단 텍스트로도 보고 싶을 때용

const fileInputRef = ref<HTMLInputElement | null>(null)

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

// 본문에 이미지 마크다운 추가
const insertImageToContent = (url: string) => {
  const mdImage = `\n\n![image](${url})\n`
  content.value += mdImage
  // 이미지 추가했을 때는 자동으로 한 번만 미리보기 갱신
  updatePreview()
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

  try {
    loading.value = true
    errorMsg.value = ''
    const url = await uploadImage(file) // 백엔드에 업로드 후 절대 URL 반환
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
    target.value = ''
  }
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

  loading.value = true
  errorMsg.value = ''

  try {
    const id = await createPost({
      title: titleTrim,
      summary: summary.value.trim(),
      content: contentTrim, // 여기 안에 마크다운 + 이미지 URL 포함
      tags: tags.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      authorId: auth.user.uid,
      authorName: auth.user.email || 'user',
      isPublished: true,
    })

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
        v-model="content"
        rows="10"
        placeholder="내용 (마크다운 지원, 예: # 제목)"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-2 font-mono"
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

    <p v-if="errorMsg" class="text-[10px] text-red-400">
      {{ errorMsg }}
    </p>
  </div>
</template>
