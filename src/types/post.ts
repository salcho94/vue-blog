export interface Post {
  id: string
  title: string
  content: string
  summary?: string
  thumbnailUrl?: string
  tags: string[]
  category?: string
  authorId: string
  authorName?: string
  createdAt: any
  updatedAt: any
  views: number
  likes: number
  isPublished: boolean
}
