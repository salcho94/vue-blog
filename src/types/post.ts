export type Category =
  | 'Java'
  | 'TypeScript/JavaScript'
  | 'React'
  | 'Vue'
  | 'GitHub'
  | 'Other'
  | '여행'

export interface Post {
  id: string
  title: string
  content: string
  summary?: string
  thumbnailUrl?: string
  tags: string[]
  category: Category
  authorId: string
  authorName?: string
  createdAt: any
  updatedAt: any
  views: number
  likes: number
  isPublished: boolean
}
