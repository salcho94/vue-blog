// src/services/upload.ts
import axios from 'axios'

const API_BASE_URL = 'http://js94.kro.kr:518'

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await axios.post(`${API_BASE_URL}/blog/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  })

  const url: string = res.data.url // ← "/blog/images/20250223/xxx.png" 형태

  // 백엔드에서 절대경로를 주면 그대로 사용, 상대경로면 baseURL 붙이기
  if (url.startsWith('http')) {
    return url
  }
  return `${API_BASE_URL}${url}`
}
