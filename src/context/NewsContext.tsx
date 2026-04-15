import React, { createContext, useContext, useState, useEffect } from 'react'
import { Article } from '../types'

interface NewsContextType {
  articles: Article[]
  loading: boolean
  error: string | null
  searchArticles: (query: string) => void
  getArticleById: (id: string) => Article | undefined
  saveArticle: (article: Article) => void
  getSavedArticles: () => Article[]
}

const NewsContext = createContext<NewsContextType | undefined>(undefined)

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchArticles = async (query: string) => {
    setLoading(true)
    try {
      // Mock API call
      setArticles([])
    } catch (err) {
      setError('Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  const getArticleById = (id: string) => {
    return articles.find(a => a.id === id)
  }

  const saveArticle = (article: Article) => {
    // Save to localStorage or API
  }

  const getSavedArticles = () => {
    // Get from localStorage or API
    return []
  }

  return (
    <NewsContext.Provider value={{ articles, loading, error, searchArticles, getArticleById, saveArticle, getSavedArticles }}>
      {children}
    </NewsContext.Provider>
  )
}

export const useNews = () => {
  const context = useContext(NewsContext)
  if (!context) {
    throw new Error('useNews must be used within NewsProvider')
  }
  return context
}