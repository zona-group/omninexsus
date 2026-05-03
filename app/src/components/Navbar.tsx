import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { User, Settings, LogOut, Menu, X, MessageSquare, DollarSign } from 'lucide-react';

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openLogin = () => { onLoginClick ? onLoginClick() : setShowLoginModal(true); };
  const openRegister = () => { onRegisterClick ? onRegisterClick() : setShowRegisterModal(true); };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><span className="text-white font-bold text-sm">O</span></div>
            <div><div className="font-bold text-lg gradient-text">OmniNexus</div><div className="text-xs text-muted-foreground">AI Platform</div></div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link to="/chat" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"><MessageSquare className="w4 h-4" />Chat</Link>
            <Link to="/pricing" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"><DollarSign className="w4 h-4" />Pricing</Link>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (<div className="flex items-center gap-2"><Button variant="ghost" size="sm" className="hidden sm:flex bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90" onClick={()=>navigate('/chat')}>Open Chat</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="relative h-9 w-9 rounded-full"><img src={user?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=6366f1&color=fff`} alt={user?.name} className="h-8 w-8 rounded-full object-cover"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><div className="px-3 py-2"><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-muted-foreground">{user?.email}</p></div><DropdownMenuSeparator/><DropdownMenuItem onClick={()=>navigate('/profile')}><User className="mr-2 h-4 w-4"/>Profile</DropdownMenuItem><DropdownMenuItem onClick={()=>navigate('/profile')}><Settings className="mr-2 h-4 w-4"/>Settings</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem onClick={logout} className="text-red-500"><LogOut className="mr-2 h-4 w-4"/>Logout</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>) : (<div className="hidden sm:flex items-center gap-2"><Button variant="ghost" size="sm" onClick={openLogin}>Login</Button><Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600" onClick={openRegister}>Sign Up Free</Button></div>)}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}</Button>
          </div>
        </div>
        {mobileMenuOpen&&(<div className="md:hidden py-4 border-t border-border/50"><div className="flex flex-col gap-2"><Link to="/chat" className="px-3 py-2 text-sm hover:bg-secondary rounded-lg flex items-center gap-2" onClick={()=>setMobileMenuOpen(false)}><MessageSquare className="w4 h-4"/>Chat</Link><Link to="/pricing" className="px-3 py-2 text-sm hover:bg-secondary rounded-lg flex items-center gap-2" onClick={()=>setMobileMenuOpen(false)}><DollarSign className="w4 h-4"/>Pricing</Link>{!isAuthenticated&&(<><Button variant="ghost" className="justify-start" onClick={()=>{sstMobileMenuOpen(false);openLogin();}}>Login</Button><Button className="bg-gradient-to-r from-indigo-500 to-purple-600 justify-start" onClick={()=>{setMobileMenuOpen(false);openRegister();}}>Sign Up Free</Button></>)}</div></div>)}
      </div>
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="text-center gradient-text">Welcome Back</DialogTitle></DialogHeader><LoginForm onClose={()=>setShowLoginModal(false)} onRegisterClick={()=>{setShowLoginModal(false);setShowRegisterModal(true);}}/></DialogContent></Dialog>
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="text-center gradient-text">Create Account</DialogTitle></DialogHeader><RegisterForm onClose={()=>setShowRegisterModal(false)} onLoginClick={()=>{setShowRegisterModal(false);setShowLoginModal(true);}}/></DialogContent></Dialog>
    </nav>
  );
}
function LoginForm({onClose,onRegisterClick}:{onClose:()=>void;onRegisterClick:()=>void}){
  const {login,loginWithGoogle}=useAuth();const navigate=useNavigate();
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');
  const [loading,setLoading]=useState(false);const [error,setError]=useState('');
  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');const ok=await login(email,password);if(ok){onClose();navigate('/chat');}else setError('Invalid email or password');setLoading(false);};
  return(<form onSubmit={handleSubmit} className="space-y-4"><Button type="button" variant="outline" className="w-full" onClick={async()=>{await loginWithGoogle();onClose();navigate('/chat');}}>Continue with Google</Button>{error&&<p className="text-sm text-red-500">{error}</p>}<Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>{loading?'Logging in...':'Login'}</Button><p className="text-center text-sm text-muted-foreground">No account?<button type="button" onClick={onRegisterClick} className="text-primary hover:underline">Sign up free</button></p></form>);
}
function RegisterForm({onClose,onLoginClick}:{onClose:()=>void;onLoginClick:()=>void}){
  const {register}=useAuth();const navigate=useNavigate();
  const [name,setName]=useState('');const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');
  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');const ok=await register(email,password,name);if(ok){onClose();navigate('/chat');}else setError('Email already exists');setLoading(false);};
  return(<form onSubmit={handleSubmit} className="space-y-4">{error&&<p className="text-sm text-red-500">{error}</p>}<Input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required/><Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><Button type="submit" className="w5full bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>{loading?'Creating account...':'Create Account'}</Button><p className="text-center text-sm text-muted-foreground">Have an account?<button type="button" onClick={onLoginClick} className="text-primary hover:underline">Login</button></p></form>);
}
