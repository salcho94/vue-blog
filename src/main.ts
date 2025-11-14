// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from './stores/auth.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// ✅ Pinia 활성화된 뒤에 스토어 생성해야 함
const auth = useAuthStore()

// 선택: 초기화
auth.init?.()

// ✅ 전역으로 붙이기
app.config.globalProperties.$auth = auth

app.mount('#app')
