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

// ❤️ 좋아요 상태
const liked = ref(false)

const postId = computed(() => route.params.id as string)

const loadPostAndComments = async (id: string) => {
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
    incrementPostViews(id).catch(() => {})
    comments.value = await getComments(id)

    // 로그인 상태면 좋아요 여부도 로드
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

// 로그인 상태 바뀔 때 좋아요 상태 재확인
watch(
  () => auth.user,
  async (user) => {
    if (post.value && user) {
      liked.value = await getUserLikeStatus(postId.value, user.uid)
    } else {
      liked.value = false
    }
  },
)

const isOwner = computed(
  () => !!(auth.user && post.value && auth.user.uid === post.value.authorId),
)

const submitComment = async () => {
  if (!auth.user) {
    alert('로그인이 필요합니다.')
    return
  }
  const content = newComment.value.trim()
  if (!content || !postId.value) return

  await addComment({
    postId: postId.value,
    authorId: auth.user.uid,
    authorName: auth.user.email || 'user',
    content,
  })

  newComment.value = ''
  comments.value = await getComments(postId.value)
}

const removeCommentClick = async (id: string, authorId: string) => {
  if (!auth.user || auth.user.uid !== authorId) return
  await deleteComment(id)
  if (postId.value) {
    comments.value = await getComments(postId.value)
  }
}

const deletePostClick = async () => {
  if (!post.value) return
  if (!confirm('이 글을 삭제할까요?')) return
  await removePost(post.value.id)
  location.href = '/'
}

// ❤️ 좋아요 토글
const toggleLikeClick = async () => {
  if (!post.value) return
  if (!auth.user) {
    alert('로그인이 필요합니다.')
    return
  }

  try {
    const res = await toggleLike(post.value.id, auth.user.uid)
    liked.value = res.liked
    if (post.value) {
      post.value.likes = res.likes
    }
  } catch (e: any) {
    console.error(e)
    alert('좋아요 처리 중 오류가 발생했습니다.')
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <div v-if="loading" class="text-xs text-slate-500">
      loading...
    </div>

    <div v-else-if="errorMsg" class="text-xs text-red-400">
      {{ errorMsg }}
    </div>

    <div v-else-if="post" class="space-y-5">
      <!-- 헤더 -->
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {{ post.title }}
        </h1>

        <div class="flex flex-wrap items-center gap-2 text-[9px] text-slate-500">
          <span>{{ post.views ?? 0 }} views</span>

          <!-- 좋아요 버튼 + 카운트 -->
          <button
            @click="toggleLikeClick"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-md
                   border border-slate-300/80 dark:border-slate-600/80
                   bg-white/90 dark:bg-slate-900/80
                   hover:border-cyan-400 hover:text-cyan-300
                   transition-colors"
          >
            <span class="text-xs">
              {{ liked ? '★' : '☆' }}
            </span>
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
            edit
          </RouterLink>

          <button
            v-if="isOwner"
            @click="deletePostClick"
            class="px-2 py-1 rounded-md
                   bg-red-500 text-white hover:bg-red-400
                   transition-colors"
          >
            delete
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

      <!-- 댓글 -->
      <section class="space-y-3">
        <h2
          class="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2"
        >
          comments
          <span class="text-[9px] text-slate-500">
            ({{ comments.length }})
          </span>
        </h2>

        <!-- 입력 영역 -->
        <div v-if="auth.user" class="flex gap-2 items-start">
          <textarea
            v-model="newComment"
            rows="2"
            class="flex-1 rounded-md
                   border border-slate-300 dark:border-slate-700
                   bg-white dark:bg-slate-950
                   px-2 py-1.5 text-[11px]
                   text-slate-800 dark:text-slate-100
                   resize-none
                   focus:outline-none
                   focus:ring-1 focus:ring-black
                   dark:focus:ring-yellow-400"
            placeholder="댓글을 입력하세요"
          ></textarea>
          <button
            @click="submitComment"
            class="px-3 py-1.5 rounded-md text-[10px] font-semibold
                   bg-black text-white hover:bg-slate-800
                   dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300
                   transition-colors"
          >
            등록
          </button>
        </div>

        <div v-else class="text-[10px] text-slate-500">
          댓글을 작성하려면 로그인하세요.
        </div>

        <!-- 댓글 목록 -->
        <div v-if="comments.length" class="space-y-1.5">
          <div
            v-for="c in comments"
            :key="c.id"
            class="flex items-start justify-between gap-2
                   rounded-md bg-slate-100 dark:bg-slate-900/80
                   px-2 py-1.5 text-[10px]"
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
              class="mt-1 text-[9px] text-red-400 hover:text-red-300"
            >
              삭제
            </button>
          </div>
        </div>

        <div v-else class="text-[10px] text-slate-500">
          아직 댓글이 없습니다.
        </div>
      </section>
    </div>
  </div>
</template>
