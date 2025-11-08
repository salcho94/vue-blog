<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAllPosts } from '@/services/posts'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const posts = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const auth = useAuthStore()

onMounted(async () => {
  try {
    posts.value = await getAllPosts()
  } catch (e: any) {
    error.value = e.message || '목록 불러오기 실패'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>게시글 목록</h1>

    <RouterLink v-if="auth.user" to="/admin/new">
      새 글 작성
    </RouterLink>

    <p v-if="loading">로딩중...</p>
    <p v-else-if="error" style="color:red;">{{ error }}</p>

    <ul v-else>
      <li v-for="post in posts" :key="post.id">
        <RouterLink :to="`/posts/${post.id}`">
          {{ post.title }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
