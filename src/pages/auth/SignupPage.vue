<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter, RouterLink } from 'vue-router'
import { useModalStore } from '@/stores/modal.store' // ✅ 전역 모달 스토어

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()
const modal = useModalStore() // ✅ 전역 모달 인스턴스

// 간단 이메일 형식 검증
const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const doSignup = async () => {
  const emailTrim = email.value.trim()
  const pw = password.value
  const pwc = passwordConfirm.value

  // 🔒 선검증
  if (!emailTrim) {
    modal.alert({
      title: '회원가입 오류',
      message: '이메일을 입력하세요.',
      type: 'error',
    })
    return
  }
  if (!emailPattern.test(emailTrim)) {
    modal.alert({
      title: '회원가입 오류',
      message: '올바른 이메일 형식을 입력하세요.',
      type: 'error',
    })
    return
  }
  if (pw.length < 6) {
    modal.alert({
      title: '회원가입 오류',
      message: '비밀번호는 6자 이상이어야 합니다.',
      type: 'error',
    })
    return
  }
  if (pw !== pwc) {
    modal.alert({
      title: '회원가입 오류',
      message: '비밀번호가 일치하지 않습니다.',
      type: 'error',
    })
    return
  }

  loading.value = true
  try {
    await auth.signup(emailTrim, pw)

    // 성공 모달 보여주고 싶으면 이렇게
    modal.alert({
      title: '회원가입 완료',
      message: '성공적으로 가입되었습니다.',
      type: 'success',
    })

    router.push('/')
  } catch (e: any) {
    const raw = e?.code || e?.message || ''
    let msg = '회원가입에 실패했습니다.'

    if (raw.includes('auth/email-already-in-use')) {
      msg = '이미 사용 중인 이메일입니다.'
    } else if (raw.includes('auth/invalid-email')) {
      msg = '올바른 이메일 형식을 입력하세요.'
    }

    modal.alert({
      title: '회원가입 오류',
      message: msg,
      type: 'error',
    })
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
        class="w-full rounded-md border border-slate-300 dark:border-slate-700
               bg-white dark:bg-slate-950 px-2 py-1"
      />
      <input
        v-model="password"
        type="password"
        placeholder="password (6자 이상)"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700
               bg-white dark:bg-slate-950 px-2 py-1"
      />
      <input
        v-model="passwordConfirm"
        type="password"
        placeholder="password 확인"
        class="w-full rounded-md border border-slate-300 dark:border-slate-700
               bg-white dark:bg-slate-950 px-2 py-1"
      />

      <button
        @click="doSignup"
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
        {{ loading ? '가입 중…' : '회원가입' }}
      </button>
    </div>

    <p class="text-[10px] text-slate-500">
      이미 계정이 있나요?
      <RouterLink
        to="/login"
        class="
          ml-1 inline-flex items-center
          px-1.5 py-0.5 rounded
          text-[10px] font-semibold
          text-slate-900 hover:bg-slate-100
          dark:text-yellow-300 dark:hover:bg-slate-800
          transition-colors
        "
      >
        로그인
      </RouterLink>
    </p>
  </div>
</template>
