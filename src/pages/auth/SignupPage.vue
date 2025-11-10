<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, RouterLink } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const auth = useAuthStore()
const router = useRouter()

const doSignup = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.signup(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    errorMsg.value = e.message || '회원가입 실패'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto space-y-4">
    <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
      sign up
    </h1>

    <div class="space-y-2 text-[11px]">
      <input
        v-model="email"
        type="email"
        placeholder="email"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />
      <input
        v-model="password"
        type="password"
        placeholder="password (6자 이상)"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />
      <button
        @click="doSignup"
        :disabled="loading"
        class="w-full mt-1 rounded-md bg-cyan-400 text-slate-950 py-1 font-semibold hover:bg-cyan-300 disabled:opacity-60"
      >
        회원가입
      </button>
    </div>

    <p v-if="errorMsg" class="text-[10px] text-red-400">{{ errorMsg }}</p>

    <p class="text-[10px] text-slate-500">
      이미 계정이 있나요?
      <RouterLink to="/login" class="text-cyan-400">로그인</RouterLink>
    </p>
  </div>
</template>
