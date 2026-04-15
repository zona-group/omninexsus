import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NewsProvider } from './context/NewsContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import SearchResults from './pages/SearchResults'
import ArticleDetail from './pages/ArticleDetail'
import Profile from './pages/Profile'
import SavedArticles from './pages/SavedArticles'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

function App() {
  return (
    <AuthProvider>
      <NewsProvider>
        <div className="app-container">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/saved" element={<SavedArticles />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </NewsProvider>
    </AuthProvider>
  )
}

export default App