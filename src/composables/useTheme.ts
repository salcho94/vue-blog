// src/composables/useTheme.ts
import { ref, onMounted, watch } from 'vue'

export function useTheme() {
  const isDark = ref(true)

  const applyTheme = () => {
    const root = document.documentElement
    if (isDark.value) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') isDark.value = true
    else if (saved === 'light') isDark.value = false
    applyTheme()
  })

  watch(isDark, applyTheme)

  return {
    isDark,
    toggleTheme,
  }
}
