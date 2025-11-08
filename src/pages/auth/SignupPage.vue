<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, RouterLink } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const auth = useAuthStore()
const router = useRouter()

const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    await auth.signup(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.message || '회원가입 실패'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1>회원가입</h1>
    <form @submit.prevent="onSubmit">
      <div>
        <input v-model="email" type="email" placeholder="이메일" required />
      </div>
      <div>
        <input v-model="password" type="password" placeholder="비밀번호" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '처리중...' : '가입하기' }}
      </button>
      <p v-if="error" style="color:red;">{{ error }}</p>
    </form>
    <p>
      이미 계정이 있나요?
      <RouterLink to="/login">로그인</RouterLink>
    </p>
  </div>
</template>
