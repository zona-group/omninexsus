import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Calendar, Bookmark, Settings, LogOut, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your profile</h1>
          <p className="text-muted-foreground mb-6">Create an account or log in to access your profile and saved articles.</p>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSave = () => {
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold gradient-text mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-secondary/30 rounded-2xl p-6 text-center">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=128`}
                alt={user?.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-primary/20"
              />
              <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/saved')}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved Articles
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="bg-secondary/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Information
                </h3>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  {editing ? (
                    <Input value={name} onChange={e => setName(e.target.value)} />
                  ) : (
                    <p className="font-medium">{user?.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  {editing ? (
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  ) : (
                    <p className="font-medium">{user?.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-secondary/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold gradient-text">0</div>
                  <div className="text-sm text-muted-foreground">Saved Articles</div>
                </div>
                <div className="bg-background/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold gradient-text">0</div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
