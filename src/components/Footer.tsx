import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Mail, Globe, ChevronUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080c14] border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <div className="font-bold text-lg gradient-text">OmniNexus</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Global News in Your Language. Real-time headlines, AI-powered translation, and personalized news experience.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/saved" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Saved Articles
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/?cat=technology" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/?cat=business" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/?cat=gamingconst userArticles = [];" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Science
                </Link>
              </li>
              <li>
                <Link to="/?cat=health" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Health
                </Link>
              </li>
              <li>
                <Link to="/?cat=sports" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/?cat=entertainment" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Entertainment
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                info@omninexsus.com
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Globe className="w-4 h-4 text-primary" />
                www.omninexsus.com
              </li>
              <li className="text-sm text-muted-foreground">
                Response time: Within 24 hours
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Link
                to="/#contact"
                className="text-xs px-3 py-1.5 bg-secondary/50 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
              >
                General Contact
              </Link>
              <Link
                to="/#contact"
                className="text-xs px-3 py-1.5 bg-secondary/50 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
              >
                Partnership
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              © 2026 OmniNexus. All rights reserved.
            </span>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
              title="Scroll to top"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
