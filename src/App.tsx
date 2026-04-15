import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NewsProvider } from '@/context/NewsContext';
import { Sonner } from '@/components/ui/sonner';

// Pages
import Home from '@/pages/Home';
import ArticleDetail from '@/pages/ArticleDetail';
import SavedArticles from '@/pages/SavedArticles';
import Profile from '@/pages/Profile';
import About from '@/pages/About';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Admin from '@/pages/Admin';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SearchResults from '@/pages/SearchResults';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NewsProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/saved" element={<SavedArticles />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
          <Sonner />
        </NewsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
