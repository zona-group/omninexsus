import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '@/context/NewsContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bookmark, 
  MessageCircle, 
  ExternalLink, 
  Calendar, 
  Globe, 
  TrendingUp,
  Cpu,
  Briefcase,
  FlaskConical,
  Heart,
  Trophy,
  Film,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types';

const categories: { id: Category; name: string; icon: React.ReactNode }[] = [
  { id: 'general', name: 'Top Stories', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'technology', name: 'Technology', icon: <Cpu className="w-4 h-4" /> },
  { id: 'business', name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'science', name: 'Science', icon: <FlaskConical className="w-4 h-4" /> },
  { id: 'health', name: 'Health', icon: <Heart className="w-4 h-4" /> },
  { id: 'sports', name: 'Sports', icon: <Trophy className="w-4 h-4" /> },
  { id: 'entertainment', name: 'Entertainment', icon: <Film className="w-4 h-4" /> },
];

const breakingNews = [
  'Markets reach all-time high amid AI boom',
  'New climate accord signed by 120 nations',
  'SpaceX Starship completes lunar mission',
  'WHO announces breakthrough cancer treatment',
  'Tech giants unveil next-gen AI assistants',
  'Global GDP growth surpasses 4% forecast',
];

export default function Home() {
  const { articles, loading, currentCategory, setCategory, saveArticle, unsaveArticle, isArticleSaved } = useNews();
  const { isAuthenticated } = useAuth();
  const [displayedArticles, setDisplayedArticles] = useState(6);

  useEffect(() => {
    setCategory('general');
  }, []);

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

  const loadMore = () => {
    setDisplayedArticles(prev => prev + 6);
  };

  const filteredArticles = currentCategory === 'general' 
    ? articles 
    : articles.filter(a => a.category === currentCategory);

  const heroArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1, displayedArticles);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breaking News Ticker */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-4">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 shrink-0">
              â¡ BREAKING
            </Badge>
            <div className="overflow-hidden flex-1">
              <div className="flex gap-8 ticker-content whitespace-nowrap">
                {[...breakingNews, ...breakingNews].map((news, i) => (
                  <span key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    {news}
                    <span className="text-primary">â</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`cat-btn flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  currentCategory === cat.id
                    ? 'active border-transparent'
                    : 'bg-secondary/50 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-primary'
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Title */}
        <h1 className="text-2xl font-bold mb-6">
          {categories.find(c => c.id === currentCategory)?.name || 'Latest Headlines'}
        </h1>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-[300px] rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Article */}
            {heroArticle && (
              <div className="mb-8">
                <Link to={`/article/${heroArticle.id}`}>
                  <div className="hero-card group relative h-[400px] md:h-[500px] bg-gradient-to-br from-slate-800 to-slate-900">
                    <img
                      src={heroArticle.urlToImage || 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=1200&q=80'}
                      alt={heroArticle.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="eager"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80';
                      }}
                    />
                    <div className="hero-overlay" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          {heroArticle.source?.name}
                        </Badge>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          Breaking
                        </Badge>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 line-clamp-2">
                        {heroArticle.title}
                      </h2>
                      {heroArticle.description && (
                        <p className="text-gray-300 text-sm md:text-base mb-4 line-clamp-2 max-w-2xl">
                          {heroArticle.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(heroArticle.publishedAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className={isArticleSaved(heroArticle.id) ? 'text-primary' : ''}
                            onClick={() => handleSave(heroArticle)}
                          >
                            <Bookmark className="w-4 h-4 mr-1" />
                            {isArticleSaved(heroArticle.id) ? 'Saved' : 'Save'}
                          </Button>
                          <Button variant="secondary" size="sm">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Discuss
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                            Read
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Articles Grid */}
            {gridArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article, index) => (
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
              <div className="empty-state">
                <div className="empty-state-icon">ð</div>
                <div className="empty-state-title text-xl font-semibold mb-2">
                  No articles found
                </div>
                <div className="text-muted-foreground">
                  Try a different category or check back later.
                </div>
              </div>
            )}

            {/* Load More */}
            {displayedArticles < filteredArticles.length && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  className="gap-2"
                >
                  Load more stories
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Contact Section */}
        <section id="contact" className="mt-20 scroll-mt-20">
          <div className="bg-gradient-to-br from-secondary/50 to-background rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold gradient-text mb-4">Contact Us</h2>
                <p className="text-muted-foreground mb-8">
                  Questions, suggestions, or partnership proposals? Leave us a message and our team will get back to you shortly.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">ð§</span>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Email</div>
                      <div>info@omninexsus.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Website</div>
                      <div>www.omninexsus.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">â±</span>
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Response Time</div>
                      <div>Within 24 hours</div>
                    </div>
                  </div>
                </div>
              </div>
              <form className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button type="button" variant="secondary" size="sm" className="flex-1">
                    ð¬ General Contact
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="flex-1">
                    ð¤ Partnership
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="form-input w-full"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="form-input w-full"
                />
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  className="form-input w-full resize-none"
                />
                <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
