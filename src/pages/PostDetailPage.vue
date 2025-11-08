<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getPost, removePost } from '@/services/posts'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const post = ref<any | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    post.value = await getPost(route.params.id as string)
  } catch (e: any) {
    error.value = e.message || '글 불러오기 실패'
  } finally {
    loading.value = false
  }
})

const onDelete = async () => {
  if (!post.value) return
  if (!confirm('삭제할까요?')) return
  await removePost(post.value.id)
  router.push('/posts')
}
</script>

<template>
  <div>
    <p v-if="loading">로딩중...</p>
    <p v-else-if="error" style="color:red;">{{ error }}</p>

    <div v-else-if="post">
      <h1>{{ post.title }}</h1>
      <p style="white-space: pre-wrap;">{{ post.content }}</p>

      <div v-if="auth.user" style="margin-top:12px; display:flex; gap:8px;">
        <RouterLink :to="`/admin/edit/${post.id}`">수정</RouterLink>
        <button @click="onDelete">삭제</button>
      </div>
    </div>
  </div>
</template>
