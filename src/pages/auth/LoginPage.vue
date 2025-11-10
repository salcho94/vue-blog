<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { loginWithGoogle } from '@/services/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const doLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    errorMsg.value = e.message || '로그인 실패'
  } finally {
    loading.value = false
  }
}

const doGoogle = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await loginWithGoogle()
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    errorMsg.value = e.message || '구글 로그인 실패'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto space-y-4">
    <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
      login
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
        placeholder="password"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1"
      />
      <button
        @click="doLogin"
        :disabled="loading"
        class="w-full mt-1 rounded-md bg-cyan-400 text-slate-950 py-1 font-semibold hover:bg-cyan-300 disabled:opacity-60"
      >
        로그인
      </button>
      <button
        @click="doGoogle"
        :disabled="loading"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700 py-1 text-slate-700 dark:text-slate-200 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-60"
      >
        Google 로그인
      </button>
    </div>

    <p v-if="errorMsg" class="text-[10px] text-red-400">{{ errorMsg }}</p>

    <p class="text-[10px] text-slate-500">
      계정이 없나요?
      <RouterLink to="/signup" class="text-cyan-400">회원가입</RouterLink>
    </p>
  </div>
</template>
