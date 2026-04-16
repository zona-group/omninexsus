import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNews } from '@/context/NewsContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bookmark, 
  MessageCircle, 
  ExternalLink, 
  Calendar, 
  User,
  ArrowLeft,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Send,
  ThumbsUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getArticleById, saveArticle, unsaveArticle, isArticleSaved, addComment, getComments } = useNews();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getArticleById(id);
      if (found) {
        setArticle(found);
        setComments(getComments(id));
      } else {
        toast.error('Article not found');
        navigate('/');
      }
    }
  }, [id]);

  const handleSave = () => {
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

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = article.title;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        setShowShareMenu(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    addComment(article.id, commentText, user?.name || 'Anonymous');
    setComments(getComments(article.id));
    setCommentText('');
    toast.success('Comment added');
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-4xl mb-4">ð°</div>
          <h1 className="text-2xl font-bold mb-2">Loading article...</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Article Header */}
        <article className="mb-12">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {article.source?.name}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {article.author && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Featured Image */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <img
              src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'}
              alt={article.title}
              className="w-full h-[300px] md:h-[400px] object-cover"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between py-4 border-y border-border/50 mb-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className={isArticleSaved(article.id) ? 'text-primary border-primary' : ''}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {isArticleSaved(article.id) ? 'Saved' : 'Save'}
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {showShareMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-2 z-10 animate-fadeIn">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary rounded-lg"
                    >
                      <Twitter className="w-4 h-4 text-blue-400" />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bs-secondary rounded-lg"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary rounded-lg"
                    >
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary rounded-lg"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Original
              </Button>
            </a>
          </div>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {article.description}
          </p>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              {article.content || `${article.description} This is a detailed article about ${article.title}. The content continues with in-depth analysis and expert opinions on the subject matter. Stay tuned for more updates and breaking news on this developing story.`}
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Experts in the field have been closely monitoring the situation, providing valuable insights and analysis. The implications of this development are far-reaching and could have significant impacts on various sectors.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              As the story continues to unfold, we will keep you updated with the latest information and expert commentary. Make sure to follow our coverage for comprehensive analysis and breaking updates.
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Breaking News', article.category || 'General', article.source?.name].map((tag, i) => (
              <Badge key={i} variant="secondary" className="cursor-pointer hover:bs-primary/20">
                #{tag}
              </Badge>
            ))}
          </div>
        </article>

        {/* Comments Section */}
        <section id="comments" className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <div className="bg-secondary/30 rounded-xl p-6 mb-8">
            {isAuthenticated ? (
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-3 bg-background border-border/50"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSubmitComment} className="bg-gradient-to-r from-indigo-500 to-purple-600">
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Please login to join the discussion</p>
                <Button onClick={() => toast.info('Login feature coming soon')}>
                  Login
                </Button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-secondary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likes}
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-primary">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>

        {/* Related Articles */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Link key={i} to={`/article/${i}`}>
                <div className="news-card p-4 flex gap-4">
                  <img
                    src={`https://images.unsplash.com/photo-${i === 1 ? '1504711434969-e33886168f5c' : '1495020689067-958852c7762f'}?w=200`}
                    alt="Related"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <Badge variant="secondary" className="mb-2">Related</Badge>
                    <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                      {i === 1 ? 'Similar developments in the industry' : 'Expert analysis on current trends'}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
