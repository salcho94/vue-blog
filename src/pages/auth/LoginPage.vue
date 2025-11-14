<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { loginWithGoogle } from '@/services/auth'
import { useModalStore } from '@/stores/modal.store'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const modal = useModalStore()

const isKakaoInAppBrowser = () => {
  if (typeof navigator === 'undefined') return false
  return /KAKAOTALK/i.test(navigator.userAgent)
}

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
  // ✅ 카카오 인앱 브라우저에서는 바로 막고 모달 안내
  if (isKakaoInAppBrowser()) {
    modal.alert({
      title: '브라우저 안내',
      message:
        '카카오톡 내 브라우저에서는 구글 로그인이 지원되지 않습니다.\n' +
        '오른쪽 상단 ••• 메뉴에서 "기본 브라우저로 열기"를 선택한 뒤 다시 접속해 주세요.',
      type: 'info',
    })
    return
  }

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
        class="
          w-full mt-1 rounded-md py-1.5 text-[12px] font-semibold
          bg-slate-900 text-white hover:bg-slate-800
          dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1
          dark:focus:ring-yellow-300 dark:focus:ring-offset-slate-900
        "
      >
        로그인
      </button>

      <button
        @click="doGoogle"
        :disabled="loading"
        class="
          w-full mt-1 rounded-md py-1.5 text-[12px] font-semibold
          bg-slate-900 text-white hover:bg-slate-800
          dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1
          dark:focus:ring-yellow-300 dark:focus:ring-offset-slate-900
        "
      >
        Google 로그인
      </button>
    </div>

    <p v-if="errorMsg" class="text-[10px] text-red-400">
      {{ errorMsg }}
    </p>

    <p class="text-[10px] text-slate-500">
      계정이 없나요?
      <RouterLink
        to="/signup"
        class="
          ml-1 inline-flex items-center
          px-1.5 py-0.5 rounded
          text-[10px] font-semibold
          text-slate-900 hover:bg-slate-100
          dark:text-yellow-300 dark:hover:bg-slate-800
          transition-colors
        "
      >
        회원가입
      </RouterLink>
    </p>
  </div>
</template>
