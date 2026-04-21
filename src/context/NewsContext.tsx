import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Article, SavedArticle, Comment, Category } from '@/types';

interface NewsContextType {
  articles: Article[];
  savedArticles: SavedArticle[];
  comments: Comment[];
  loading: boolean;
  currentCategory: Category;
  searchQuery: string;
  searchResults: Article[];
  loadArticles: (category?: Category, page?: number) => Promise<void>;
  searchArticles: (query: string) => Promise<void>;
  saveArticle: (article: Article) => void;
  unsaveArticle: (articleId: string) => void;
  isArticleSaved: (articleId: string) => boolean;
  addComment: (articleId: string, content: string, userName: string) => void;
  getComments: (articleId: string) => Comment[];
  setCategory: (category: Category) => void;
  getArticleById: (id: string) => Article | undefined;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Markets reach all-time high amid AI boom',
    description: 'Global stock markets have reached unprecedented levels as artificial intelligence continues to drive innovation across sectors.',
    url: 'https://example.com/article1',
    urlToImage: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800',
    publishedAt: new Date().toISOString(),
    source: { name: 'Financial Times' },
    author: 'John Smith',
    content: 'Global stock markets have reached unprecedented levels...',
    category: 'business'
  },
  {
    id: '2',
    title: 'New climate accord signed by 120 nations',
    description: 'Historic agreement aims to reduce global carbon emissions by 50% before 2030.',
    url: 'https://example.com/article2',
    urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    source: { name: 'BBC News' },
    author: 'Sarah Johnson',
    content: 'In a historic move, 120 nations have signed a new climate accord...',
    category: 'gaming'
  },
  {
    id: '3',
    title: 'Tech giants unveil next-gen AI assistants',
    description: 'New AI models promise unprecedented capabilities in natural language understanding.',
    url: 'https://example.com/article3',
    urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    source: { name: 'TechCrunch' },
    author: 'Alex Wilson',
    content: 'Major tech companies have unveiled their next-generation AI assistants...',
    category: 'technology'
  },
  {
    id: '4',
    title: 'WHO announces breakthrough cancer treatment',
    description: 'New immunotherapy shows 90% success rate in clinical trials.',
    url: 'https://example.com/article4',
    urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    source: { name: 'Medical News Today' },
    author: 'Dr. Emily Brown',
    content: 'The World Health Organization has announced a breakthrough cancer treatment...',
    category: 'hardware'
  },
  {
    id: '5',
    title: 'Champions League final sets viewership record',
    description: 'Over 500 million viewers tuned in for the historic final.',
    url: 'https://example.com/article5',
    urlToImage: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    source: { name: 'ESPN' },
    author: 'Tom Bradley',
    content: 'The Champions League final has set a new viewership record...',
    category: 'sports'
  },
  {
    id: '6',
    title: 'New Marvel movie breaks box office records',
    description: 'Latest superhero film earns $500 million in opening weekend.',
    url: 'https://example.com/article6',
    urlToImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    source: { name: 'Variety' },
    author: 'Lisa Anderson',
    content: 'The latest Marvel movie has broken box office records...',
    category: 'sports'
  }
];

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('omni_saved_articles');
    if (saved) {
      setSavedArticles(JSON.parse(saved));
    }
    const savedComments = localStorage.getItem('omni_comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  const loadArticles = async (category?: Category, _page: number = 1) => {
    setLoading(true);
    try {
      const cat = category || 'general';
      const response = await fetch(`/api/news?category=${cat}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          setArticles(MOCK_ARTICLES);
        }
      } else {
        setArticles(MOCK_ARTICLES);
      }
    } catch {
      setArticles(MOCK_ARTICLES);
    }
    setLoading(false);
  };

  const searchArticles = async (query: string) => {
    setLoading(true);
    setSearchQuery(query);
    try {
      const response = await fetch(`/api/news?category=general&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const filtered = data.filter((article: Article) =>
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.description.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(filtered.length > 0 ? filtered : data);
        } else {
          setSearchResults(MOCK_ARTICLES.filter(article =>
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.description.toLowerCase().includes(query.toLowerCase())
          ));
        }
      } else {
        setSearchResults(MOCK_ARTICLES.filter(article =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase())
        ));
      }
    } catch {
      setSearchResults(MOCK_ARTICLES.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase())
      ));
    }
    setLoading(false);
  };

  const saveArticle = (article: Article) => {
    if (!isArticleSaved(article.id)) {
      const saved: SavedArticle = { ...article, savedAt: new Date().toISOString() };
      const updated = [...savedArticles, saved];
      setSavedArticles(updated);
      localStorage.setItem('omni_saved_articles', JSON.stringify(updated));
    }
  };

  const unsaveArticle = (articleId: string) => {
    const updated = savedArticles.filter(a => a.id !== articleId);
    setSavedArticles(updated);
    localStorage.setItem('omni_saved_articles', JSON.stringify(updated));
  };

  const isArticleSaved = (articleId: string) => {
    return savedArticles.some(a => a.id === articleId);
  };

  const addComment = (articleId: string, content: string, userName: string) => {
    const newComment: Comment = {
      id: 'comment_' + Date.now(),
      articleId,
      userId: 'user_' + Date.now(),
      userName,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    const updated = [...comments, newComment];
    setComments(updated);
    localStorage.setItem('omni_comments', JSON.stringify(updated));
  };

  const getComments = (articleId: string) => {
    return comments.filter(c => c.articleId === articleId);
  };

  const setCategory = (category: Category) => {
    setCurrentCategory(category);
    loadArticles(category);
  };

  const getArticleById = (id: string) => {
    return articles.find(a => a.id === id) || savedArticles.find(a => a.id === id);
  };

  return (
    <NewsContext.Provider value={{
      articles,
      savedArticles,
      comments,
      loading,
      currentCategory,
      searchQuery,
      searchResults,
      loadArticles,
      searchArticles,
      saveArticle,
      unsaveArticle,
      isArticleSaved,
      addComment,
      getComments,
      setCategory,
      getArticleById
    }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}
