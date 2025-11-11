import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import PostsPage from '@/pages/PostsPage.vue'
import PostDetailPage from '@/pages/PostDetailPage.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import SignupPage from '@/pages/auth/SignupPage.vue'
import NewPostPage from '@/pages/admin/NewPostPage.vue'
import EditPostPage from '@/pages/admin/EditPostPage.vue'
import AboutView from '@/views/AboutView.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/posts', name: 'posts', component: PostsPage },
    { path: '/posts/:id', name: 'post-detail', component: PostDetailPage },

    { path: '/login', name: 'login', component: LoginPage },
    { path: '/signup', name: 'signup', component: SignupPage },

    {
      path: '/admin/new',
      name: 'new-post',
      component: NewPostPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/edit/:id',
      name: 'edit-post',
      component: EditPostPage,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // 1) 아직 init 안 했으면 초기화 한 번 수행
  if (!auth.initialized) {
    const maybePromise = auth.init?.()
    if (maybePromise && typeof maybePromise.then === 'function') {
      await maybePromise
    }
  }

  const isLoggedIn = !!auth.user
  const toName = to.name as string | undefined

  // 2) 보호된 라우트인데 로그인 안 되어 있으면 → 로그인 페이지로
  if (to.meta.requiresAuth && !isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  // 3) 로그인 했는데 로그인/회원가입 페이지 가려고 하면 → 홈으로
  if (isLoggedIn && (toName === 'login' || toName === 'signup')) {
    return { name: 'home' }
  }

  // 4) 그 외에는 통과
  return true
})

export default router
