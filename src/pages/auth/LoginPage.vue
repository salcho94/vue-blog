<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, RouterLink } from 'vue-router'
import { loginWithGoogle } from '@/services/auth'

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
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.message || '로그인 실패'
  } finally {
    loading.value = false
  }
}


const onGoogleLogin = async () => {
  try {
    const user = await loginWithGoogle()
    console.log('✅ 로그인 성공:', user.displayName)
  } catch (e) {
    console.error('❌ 로그인 실패', e)
  }
}

</script>

<template>
  <div>
    <h1>로그인</h1>
    <form @submit.prevent="onSubmit">
      <div>
        <input v-model="email" type="email" placeholder="이메일" required />
      </div>
      <div>
        <input v-model="password" type="password" placeholder="비밀번호" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '처리중...' : '로그인' }}
      </button>
      <button
        @click="onGoogleLogin"
        class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
      >
        Google
      </button>
      <p v-if="error" style="color:red;">{{ error }}</p>
    </form>
    <p>
      아직 계정이 없나요?
      <RouterLink to="/signup">회원가입</RouterLink>
    </p>
  </div>
</template>
