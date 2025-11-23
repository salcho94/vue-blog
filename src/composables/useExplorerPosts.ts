// src/composables/useExplorerPosts.ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { getAllPublishedPosts } from '@/services/posts'
import type { Post } from '@/types/post'

interface UseExplorerPostsProps {
  router: Router
  route: RouteLocationNormalizedLoaded
}

export function useExplorerPosts({ router, route }: UseExplorerPostsProps) {
  const posts = ref<Post[]>([])
  const loadingPosts = ref(false)
  const errorMsg = ref('')

  const refreshPosts = async () => {
    loadingPosts.value = true
    try {
      posts.value = await getAllPublishedPosts()
      errorMsg.value = ''
    } catch (err: any) {
      errorMsg.value = err?.message || '포스트를 불러올 수 없습니다.'
    } finally {
      loadingPosts.value = false
    }
  }

  const handlePostsUpdated = () => {
    refreshPosts()
  }

  onMounted(async () => {
    await refreshPosts()
    window.addEventListener('posts-updated', handlePostsUpdated)
  })

  onUnmounted(() => {
    window.removeEventListener('posts-updated', handlePostsUpdated)
  })

  const activePostId = computed(() => {
    if (route.name === 'post-detail' && typeof route.params.id === 'string') {
      return route.params.id
    }
    return null
  })

  const activePostMeta = computed(() => {
    if (route.name === 'post-detail' && typeof route.params.id === 'string') {
      const found = posts.value.find((p) => String(p.id) === route.params.id)
      if (found) {
        const createdAt =
          (found.createdAt as any)?.toDate?.().toLocaleDateString?.('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }) || ''
        return {
          title: found.title || 'untitled.md',
          author: found.authorName || '익명',
          category: (found as any).category || 'other',
          createdAt,
        }
      }
    }
    return null
  })

  const openPost = (post: Post) => {
    if (!post?.id) return
    router.push({ name: 'post-detail', params: { id: String(post.id) } })
  }

  const handleMobileSelect = (event: Event) => {
    const target = event.target as HTMLSelectElement
    const id = target.value
    if (!id) {
      router.push({ name: 'home' })
      return
    }
    router.push({ name: 'post-detail', params: { id } })
  }

  return {
    posts,
    loadingPosts,
    errorMsg,
    refreshPosts,
    activePostId,
    activePostMeta,
    openPost,
    handleMobileSelect,
  }
}
