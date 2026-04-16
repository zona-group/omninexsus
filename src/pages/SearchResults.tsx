import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useNews } from '@/context/NewsContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bookmark, 
  MessageCircle, 
  ExternalLink, 
  Search,
  ArrowLeft,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchArticles, searchResults, loading, saveArticle, unsaveArticle, isArticleSaved } = useNews();
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');

  useEffect(() => {
    if (query) {
      searchArticles(query);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
      searchArticles(searchInput);
    }
  };

  const handleSave = (article: any) => {
    if (!isAuthenticated) {
      toast.error('Please login to save articles');
      return;
    }
    if (isArticleSaved(article.id)) {
      unsaveArticle(article.id);
      toast.success('Article removed from saved');
    } else {
      saveArticle(article);
      toast.success('Article saved');
    }
  };

  // Get unique sources from results
  const sources = [...new Set(searchResults.map(a => a.source?.name).filter(Boolean))];
  const categories = [...new Set(searchResults.map(a => a.category).filter(Boolean))];

  // Filter results
  let filteredResults = searchResults;
  if (selectedSource) {
    filteredResults = filteredResults.filter(a => a.source?.name === selectedSource);
  }
  if (selectedCategory) {
    filteredResults = filteredResults.filter(a => a.category === selectedCategory);
  }

  const clearFilters = () => {
    setSelectedSource('');
    setSelectedCategory('');
    setDateRange('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 -ml-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold gradient-text mb-4">
            Search Results
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search global news..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'border-primary text-primary' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="bg-secondary/30 rounded-xl p-4 mb-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Filter Results</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Sources</option>
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Date</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Any Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <p className="text-muted-foreground">
            {loading ? 'Searching...' : `${filteredResults.length} results for "${query}"`}
          </p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((article, index) => (
              <article
                key={article.id}
                className="news-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/article/${article.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="text-xs">
                        {article.source?.name}
                      </Badge>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/article/${article.id}`}>
                    <h3 
                      className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{
                        __html: article.title.replace(
                          new RegExp(query, 'gi'),
                          match => `<span class="search-highlight">${match}</span>`
                        )
                      }}
                    />
                  </Link>
                  <p 
                    className="text-sm text-muted-foreground line-clamp-2 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: article.description?.replace(
                        new RegExp(query, 'gi'),
                        match => `<span class="search-highlight">${match}</span>`
                      ) || ''
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSave(article)}
                        className={`p-2 rounded-lg hover:bg-secondary transition-colors ${
                          isArticleSaved(article.id) ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/article/${article.id}#comments`}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any articles matching "{query}". Try different keywords or check your spelling.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  Browse All Articles
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
