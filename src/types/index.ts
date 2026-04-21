export interface Article {
  id: string
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    name: string
    id?: string
  }
  author?: string
  content?: string
  category?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  preferences?: {
    language: string
    notifications: boolean
    theme: 'dark' | 'light'
  }
}

export interface Comment {
  id: string
  articleId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
}

export interface SearchResult {
  articles: Article[]
  totalResults: number
}

export type Category = 'general' | 'technology' | 'business' | 'gaming' | 'hardware' | 'sports'

export interface CategoryInfo {
  id: Category
  name: string
  icon: string
}

export interface SavedArticle extends Article {
  savedAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  createdAt: string
  read: boolean
}

export interface AdminStats {
  totalUsers: number
  totalArticles: number
  totalComments: number
  totalSaved: number
  dailyVisits: number
}
