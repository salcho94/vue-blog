import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import PostsPage from '@/pages/PostsPage.vue'
import PostDetailPage from '@/pages/PostDetailPage.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import SignupPage from '@/pages/auth/SignupPage.vue'
import NewPostPage from '@/pages/admin/NewPostPage.vue'
import EditPostPage from '@/pages/admin/EditPostPage.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
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

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Firebase 초기 유저 정보 로딩 끝날 때까지는 일단 통과
  if (authStore.loading) return true

  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'login' }
  }

  return true
})

export default router
