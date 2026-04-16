import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  Target, 
  Award,
  ArrowRight,
  Mail
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-cyan-600/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
                About OmniNexus
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Global News in Your Language. We bring you real-time headlines from around the world, 
                powered by AI translation and personalized to your interests.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/#contact">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                    Contact Us
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">
                    Explore News
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  At OmniNexus, we believe that access to quality news should be universal. 
                  Our mission is to break down language barriers and provide everyone with 
                  access to accurate, timely, and relevant news from around the globe.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We aggregate news from trusted sources worldwide and make it accessible 
                  in multiple languages, ensuring that language is never a barrier to staying informed.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-2xl p-6 text-center">
                  <Globe className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-1">6</div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-6 text-center">
                  <Zap className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">Real-time Updates</div>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-6 text-center">
                  <Shield className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Trusted Sources</div>
                </div>
                <div className="bg-secondary/30 rounded-2xl p-6 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold mb-1">1M+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-secondary/30 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Coverage</h3>
                <p className="text-muted-foreground">
                  Access news from trusted sources worldwide. We aggregate content from 
                  leading publications across different regions and languages.
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Translation</h3>
                <p className="text-muted-foreground">
                  Read news in your preferred language with our advanced AI-powered 
                  translation system that preserves context and meaning.
                </p>
              </div>
              <div className="bg-secondary/30 rounded-2xl p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Personalized Feed</h3>
                <p className="text-muted-foreground">
                  Get news tailored to your interests. Save articles, follow topics, 
                  and create your own personalized news experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Our Values</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              The principles that guide everything we do at OmniNexus
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Trust</h3>
                <p className="text-sm text-muted-foreground">
                  We only source from verified, reputable publications
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Speed</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time updates as news breaks around the world
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  News available in multiple languages for everyone
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Curated content from the most respected news sources
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join millions of users who trust OmniNexus for their daily news. 
              Create a free account to personalize your experience.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  Start Reading
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/#contact">
                <Button size="lg" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
