// src/services/upload.ts
import axios from 'axios'

const API_BASE_URL = 'https://salchoserver.n-e.kr'

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await axios.post(`${API_BASE_URL}/blog/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  })

  const url: string = res.data.url

  return `${API_BASE_URL}${url}`
}
