import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from "@/stores/auth.store"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 🔐 Firebase 로그인 상태 감시 시작
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
