// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// ⬇️ 코드 스플리팅(권장)
const HomeFeed      = () => import('@/pages/HomeFeed.vue')        // 새로 만든 피드 컴포넌트
const PostDetail    = () => import('@/pages/PostDetailPage.vue')
const LoginPage     = () => import('@/pages/auth/LoginPage.vue')
const SignupPage    = () => import('@/pages/auth/SignupPage.vue')
const NewPostPage   = () => import('@/pages/admin/NewPostPage.vue')
const EditPostPage  = () => import('@/pages/admin/EditPostPage.vue')
const AboutView     = () => import('@/views/AboutView.vue')
const TagPage       = () => import('@/pages/TagPage.vue')

const routes: RouteRecordRaw[] = [
  // 홈 = 바로 피드
  { path: '/', name: 'home', component: HomeFeed },

  // 기존 posts 경로도 피드로 통일(북마크 호환)
  { path: '/posts', name: 'posts', component: HomeFeed },

  { path: '/posts/:id', name: 'post-detail', component: PostDetail },
  { path: '/t/:tag',    name: 'tag-view',    component: TagPage, props: true },

  { path: '/about',  name: 'about',  component: AboutView },
  { path: '/login',  name: 'login',  component: LoginPage },
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // 초기화 보장
  if (!auth.initialized && typeof auth.init === 'function') {
    await auth.init()
  }

  const isLoggedIn = !!auth.user
  const toName = String(to.name || '')

  // 보호 라우트
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 로그인 상태에서 로그인/회원가입 페이지 접근 차단
  if (isLoggedIn && (toName === 'login' || toName === 'signup')) {
    return { name: 'home' }
  }

  return true
})

export default router
