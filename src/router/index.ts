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

// 간단한 인증 가드
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (!auth.initialized) auth.init()

  if (to.meta.requiresAuth && !auth.user) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
