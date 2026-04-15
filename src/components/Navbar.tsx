import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/button'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          OmniNexus
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary">About</Link>
          {user && <Link to="/saved" className="text-sm font-medium hover:text-primary">Saved</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="text-sm font-medium hover:text-primary">Admin</Link>}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600">{user.name}</span>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/profile">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar