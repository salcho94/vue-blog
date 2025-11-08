<script setup lang="ts">
import { ref } from 'vue'
import { createPost } from '@/services/posts'
import { useRouter } from 'vue-router'

const title = ref('')
const content = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()

const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    const id = await createPost(title.value, content.value)
    router.push(`/posts/${id}`)
  } catch (e: any) {
    error.value = e.message || '작성 실패'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1>새 글 작성</h1>
    <form @submit.prevent="onSubmit">
      <div>
        <input v-model="title" placeholder="제목" required />
      </div>
      <div>
        <textarea v-model="content" rows="10" placeholder="내용" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '등록중...' : '등록' }}
      </button>
      <p v-if="error" style="color:red;">{{ error }}</p>
    </form>
  </div>
</template>
