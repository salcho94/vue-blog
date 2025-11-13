<!-- src/components/common/BaseModal.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
  message?: string
  type?: 'error' | 'info' | 'success'
  variant?: 'alert' | 'confirm'   // ✅ 여기
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const typeIcon = computed(() => {
  switch (props.type) {
    case 'success':
      return '✔'
    case 'info':
      return '🔔'
    default:
      return '!'
  }
})

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-white-500 text-white'
    case 'info':
      return 'bg-white-500 text-white'
    default:
      return 'bg-red-500 text-white'
  }
})
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-sm rounded-2xl border border-slate-200
               bg-white px-4 py-3 shadow-xl
               dark:bg-slate-900 dark:border-slate-700"
      >
        <!-- 헤더 -->
        <div class="flex items-start gap-3">
          <div
            :class="[
              'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
              typeClasses,
            ]"
          >
            {{ typeIcon }}
          </div>
          <div class="flex-1 space-y-1">
            <h2 class="text-xs font-semibold text-slate-900 dark:text-slate-50">
              {{ title || '알림' }}
            </h2>
            <p class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {{ message }}
            </p>
          </div>
        </div>

        <!-- 푸터 버튼 -->
        <div class="mt-3 flex justify-end gap-2">
          <!-- ✅ confirm 모드일 때만 취소 버튼 -->
          <button
            v-if="variant === 'confirm'"
            type="button"
            class="px-3 py-1.5 rounded-md text-[11px]
                   border border-slate-300 dark:border-slate-600
                   text-slate-600 dark:text-slate-200
                   hover:bg-slate-100 dark:hover:bg-slate-800
                   transition-colors"
            @click="emit('close')"
          >
            취소
          </button>

          <!-- 오른쪽 버튼 (alert: 확인 / confirm: 확인=삭제) -->
          <button
            type="button"
            class="px-3 py-1.5 rounded-md text-[11px] font-semibold
                   bg-slate-900 text-white hover:bg-slate-800
                   dark:bg-yellow-400 dark:text-slate-900 dark:hover:bg-yellow-300
                   transition-colors"
            @click="variant === 'confirm' ? emit('confirm') : emit('close')"
          >
            {{ variant === 'confirm' ? '삭제' : '확인' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
