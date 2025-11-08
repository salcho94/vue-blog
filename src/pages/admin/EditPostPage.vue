<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPost, updatePost } from '@/services/posts'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const title = ref('')
const content = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const post = await getPost(route.params.id as string)
    title.value = post.title
    content.value = post.content
  } catch (e: any) {
    error.value = e.message || '불러오기 실패'
  } finally {
    loading.value = false
  }
})

const onSubmit = async () => {
  saving.value = true
  error.value = ''
  try {
    await updatePost(route.params.id as string, title.value, content.value)
    router.push(`/posts/${route.params.id}`)
  } catch (e: any) {
    error.value = e.message || '수정 실패'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1>글 수정</h1>

    <p v-if="loading">로딩중...</p>
    <p v-else-if="error" style="color:red;">{{ error }}</p>

    <form v-else @submit.prevent="onSubmit">
      <div>
        <input v-model="title" required />
      </div>
      <div>
        <textarea v-model="content" rows="10" required />
      </div>
      <button type="submit" :disabled="saving">
        {{ saving ? '저장중...' : '저장' }}
      </button>
    </form>
  </div>
</template>
