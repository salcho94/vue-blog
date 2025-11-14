// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useModalStore } from '@/stores/modal.store'

// ⬇️ 코드 스플리팅(권장)
const HomeFeed      = () => import('@/pages/HomeFeed.vue')
const PostDetail    = () => import('@/pages/PostDetailPage.vue')
const LoginPage     = () => import('@/pages/auth/LoginPage.vue')
const SignupPage    = () => import('@/pages/auth/SignupPage.vue')
const NewPostPage   = () => import('@/pages/admin/NewPostPage.vue')
const EditPostPage  = () => import('@/pages/admin/EditPostPage.vue')
const AboutView     = () => import('@/views/AboutView.vue')
const TagPage       = () => import('@/pages/TagPage.vue')


const routes: RouteRecordRaw[] = [
  { path: '/',       name: 'home',   component: HomeFeed },
  { path: '/posts',  name: 'posts',  component: HomeFeed },
  { path: '/posts/:id', name: 'post-detail', component: PostDetail },
  { path: '/t/:tag', name: 'tag-view', props: true, component: TagPage },

  { path: '/about',  name: 'about',  component: AboutView },
  { path: '/login',  name: 'login',  component: LoginPage },
  { path: '/signup', name: 'signup', component: SignupPage },
  {
    path: '/admin/new',
    name: 'new-post',
    component: NewPostPage,
    // 👇 나중에 권한 쓸 거면 이렇게도 가능
    meta: { requiresAuth: true, requiresWriter: true },
  },
  {
    path: '/admin/edit/:id',
    name: 'edit-post',
    component: EditPostPage,
    meta: { requiresAuth: true, requiresWriter: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// src/router/index.ts
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const modal = useModalStore()

  // ✅ Firebase auth 상태 로딩 끝날 때까지 기다림
  if (!auth.initialized) {
    await auth.init()
  }

  const isLoggedIn = auth.isLoggedIn
  const toName = String(to.name || '')

  // 보호 라우트
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 🔒 로그인 상태에서 login / signup 접근 막기
  if (isLoggedIn && (toName === 'login' || toName === 'signup')) {
    return { name: 'home' }
  }

  // 글 작성 권한 라우트
  if (to.meta.requiresWriter) {
    if (!isLoggedIn) {
      modal.alert({
        title: '로그인 필요',
        message: '글을 작성하려면 로그인이 필요합니다.',
        type: 'info',
      })
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!auth.canWrite) {
      modal.alert({
        title: '권한 부족',
        message: '글 작성 권한이 없습니다.(https://salcho.kro.kr 관리자에게 문의하세요)',
        type: 'error',
      })
      return { name: 'home' }
    }
  }

  return true
})


export default router
