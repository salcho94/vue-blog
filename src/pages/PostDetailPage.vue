<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  getPost,
  removePost,
  incrementPostViews,
  toggleLike,
  getUserLikeStatus,
} from '@/services/posts'
import { getComments, addComment, deleteComment } from '@/services/comments'
import type { Post } from '@/types/post'
import type { Comment } from '@/types/comment'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const post = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(true)
const errorMsg = ref('')
const newComment = ref('')

// ❤️ 좋아요 상태/로딩
const liked = ref(false)
const likePending = ref(false)

const postId = computed(() => route.params.id as string)

async function loadPostAndComments(id: string) {
  if (!id) {
    errorMsg.value = '잘못된 포스트 ID입니다.'
    post.value = null
    comments.value = []
    liked.value = false
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const data = await getPost(id)
    if (!data) {
      errorMsg.value = '포스트를 찾을 수 없습니다.'
      post.value = null
      comments.value = []
      liked.value = false
      return
    }

    post.value = data

    // 조회수는 실패해도 무시
    incrementPostViews(id).catch(() => {})

    // 댓글
    comments.value = await getComments(id)

    // 좋아요 상태
    if (auth.user) {
      liked.value = await getUserLikeStatus(id, auth.user.uid)
    } else {
      liked.value = false
    }
  } catch (e: any) {
    errorMsg.value = e?.message || '불러오기 실패'
    post.value = null
    comments.value = []
    liked.value = false
  } finally {
    loading.value = false
  }
}

// 라우트 ID 바뀔 때마다 재로드
watch(
  postId,
  (id) => {
    if (id) loadPostAndComments(id)
  },
  { immediate: true },
)

// 로그인 상태가 바뀌면 좋아요/댓글 입력 가능 상태 동기화
watch(
  () => auth.user?.uid,
  async (uid) => {
    if (!post.value) return
    liked.value = uid ? await getUserLikeStatus(postId.value, uid) : false
  },
)

// 페이지 진입 시 스토어 초기화(앱 전역에서 이미 init 했다면 문제 없음)
onMounted(() => {
  auth.init?.()
})

const isOwner = computed(
  () => !!(auth.user && post.value && auth.user.uid === post.value.authorId),
)

async function submitComment() {
  if (!auth.user) {
    alert('로그인이 필요합니다.')
    return
  }
  const content = newComment.value.trim()
  if (!content || !postId.value) return

  try {
    await addComment({
      postId: postId.value,
      authorId: auth.user.uid,
      authorName: auth.user.email || 'user',
      content,
    })
    newComment.value = ''
    comments.value = await getComments(postId.value)
  } catch (e: any) {
    alert(e?.message || '댓글 등록 실패')
  }
}

async function removeCommentClick(id: string, authorId: string) {
  if (!auth.user || auth.user.uid !== authorId) return
  try {
    await deleteComment(id)
    if (postId.value) {
      comments.value = await getComments(postId.value)
    }
  } catch (e: any) {
    alert(e?.message || '댓글 삭제 실패')
  }
}

async function deletePostClick() {
  if (!post.value) return
  if (!confirm('이 글을 삭제할까요?')) return
  try {
    await removePost(post.value.id)
    router.push('/posts')
  } catch (e: any) {
    alert(e?.message || '삭제 실패')
  }
}

// ❤️ 좋아요 토글
async function toggleLikeClick() {
  if (!post.value) return
  if (!auth.user) {
    alert('로그인이 필요합니다.')
    return
  }
  if (likePending.value) return

  likePending.value = true
  try {
    const res = await toggleLike(post.value.id, auth.user.uid)
    liked.value = res.liked
    if (post.value) post.value.likes = res.likes
  } catch (e: any) {
    // Firestore rules 문제 시 여기서 보임
    console.error(e)
    alert(e?.message || '좋아요 처리 중 오류가 발생했습니다.')
  } finally {
    likePending.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div v-if="loading" class="text-xs text-slate-500">loading...</div>

    <div v-else-if="errorMsg" class="text-xs text-red-400">
      {{ errorMsg }}
    </div>

    <div v-else-if="post" class="space-y-5">
      <!-- 헤더 -->
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {{ post.title }}
        </h1>

        <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span>{{ post.views ?? 0 }} views</span>

          <!-- 좋아요 버튼 + 카운트 -->
          <button
            @click="toggleLikeClick"
            :disabled="likePending"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md
                   border border-slate-300/80 dark:border-slate-600/80
                   bg-white/90 dark:bg-slate-900/80
                   hover:border-cyan-400 hover:text-cyan-300
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-colors"
            :title="liked ? '좋아요 취소' : '좋아요'"
          >
            <span class="text-xs">{{ liked ? '★' : '☆' }}</span>
            <span>{{ post.likes ?? 0 }}</span>
          </button>

          <RouterLink
            v-if="isOwner"
            :to="`/admin/edit/${post.id}`"
            class="px-2 py-1 rounded-md
                   bg-slate-900 text-slate-100 hover:bg-black
                   dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300
                   transition-colors"
          >
            수정
          </RouterLink>

          <button
            v-if="isOwner"
            @click="deletePostClick"
            class="px-2 py-1 rounded-md
                   bg-red-500 text-white hover:bg-red-400
                   transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      <!-- 본문 -->
      <article
        class="whitespace-pre-wrap text-[14px] leading-relaxed
         text-slate-800 dark:text-slate-100
         bg-slate-50 dark:bg-slate-900/90
         rounded-2xl p-4"
      >
        {{ post.content }}
      </article>

      <!-- 본문 아래 -->
      <div
        v-if="post.tags && post.tags.length"
        class="flex flex-wrap gap-2 mt-3"
      >
  <span
    v-for="t in post.tags"
    :key="t"
    class="px-2 py-1 rounded-md text-[11px]
           bg-slate-100 dark:bg-slate-900/70
           text-slate-700 dark:text-slate-200
           border border-transparent
           hover:border-black dark:hover:border-yellow-400
           cursor-default select-none transition"
  >
    #{{ t }}
  </span>
      </div>

      <!-- 댓글 -->
      <section class="space-y-3">
        <h2 class="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
          comments
          <span class="text-[10px] text-slate-500">({{ comments.length }})</span>
        </h2>

        <!-- 입력 영역 -->
        <div v-if="auth.user" class="flex gap-2 items-start">
          <textarea
            v-model="newComment"
            rows="2"
            class="flex-1 rounded-md
                   border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-950
                   px-2 py-1.5 text-[12px]
                   text-slate-800 dark:text-slate-100
                   resize-none
                   focus:outline-none
                   focus:ring-1 focus:ring-black
                   dark:focus:ring-yellow-400"
            placeholder="댓글을 입력하세요"
          ></textarea>
          <button
            @click="submitComment"
            class="px-3 py-1.5 rounded-md text-[11px] font-semibold
                   bg-black text-white hover:bg-slate-800
                   dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300
                   transition-colors"
          >
            등록
          </button>
        </div>
        <div v-else class="text-[11px] text-slate-500">
          댓글을 작성하려면 로그인하세요.
        </div>

        <!-- 댓글 목록 -->
        <div v-if="comments.length" class="space-y-1.5">
          <div
            v-for="c in comments"
            :key="c.id"
            class="flex items-start justify-between gap-2
                   rounded-md bg-slate-100 dark:bg-slate-900/80
                   px-2 py-1.5 text-[11px]"
          >
            <div class="space-y-0.5">
              <div class="font-medium text-slate-700 dark:text-slate-300">
                {{ c.authorName || 'user' }}
              </div>
              <div class="text-slate-700 dark:text-slate-100">
                {{ c.content }}
              </div>
            </div>
            <button
              v-if="auth.user && auth.user.uid === c.authorId"
              @click="removeCommentClick(c.id, c.authorId)"
              class="mt-1 text-[10px] text-red-400 hover:text-red-300"
            >
              삭제
            </button>
          </div>
        </div>
        <div v-else class="text-[11px] text-slate-500">
          아직 댓글이 없습니다.
        </div>
      </section>
    </div>
  </div>
</template>
