import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNews } from '@/context/NewsContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  ExternalLink, 
  Calendar, 
  Trash2,
  ArrowLeft,
  Newspaper
} from 'lucide-react';
import { toast } from 'sonner';

export default function SavedArticles() {
  const { savedArticles, unsaveArticle } = useNews();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view saved articles');
      navigate('/');
    }
  }, [isAuthenticated]);

  const handleUnsave = (articleId: string) => {
    unsaveArticle(articleId);
    toast.success('Article removed from saved');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-4 -ml-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Bookmark className="w-8 h-8" />
              Saved Articles
            </h1>
            <p className="text-muted-foreground mt-2">
              {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        {savedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedArticles.map((article, index) => (
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
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="mt-1">
                        Saved {new Date(article.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUnsave(article.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No saved articles yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start saving articles you want to read later. They will appear here.
            </p>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-indigo-500 to-purple-600">
              <Newspaper className="w-4 h-4 mr-2" />
              Browse Articles
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
