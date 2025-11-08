<script setup lang="ts">
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.store'

const auth = useAuthStore()
const router = useRouter()

const logout = async () => {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <div>
    <header
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid #eee;
      "
    >
      <div style="display:flex; gap:12px; align-items:center;">
        <RouterLink to="/">MyBlog</RouterLink>
        <RouterLink to="/posts">Posts</RouterLink>
        <RouterLink v-if="auth.user" to="/admin/new">New Post</RouterLink>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <span v-if="auth.user" style="font-size: 13px; color:#666;">
          {{ auth.user.email }}
        </span>
        <button v-if="auth.user" @click="logout">Logout</button>
        <div v-else style="display:flex; gap:8px;">
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/signup">Sign up</RouterLink>
        </div>
      </div>
    </header>

    <main style="padding: 20px;">
      <RouterView />
    </main>
  </div>
</template>
