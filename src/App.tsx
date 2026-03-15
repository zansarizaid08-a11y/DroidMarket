import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, ShieldCheck, LogOut, Menu, X, Rocket, Smartphone, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './storage';
import { Developer } from './types';

// Pages (to be implemented in separate files or inline for now)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import AdminPanel from './pages/AdminPanel';
import AppsJson from './pages/AppsJson';

function Navbar({ user, isAdmin, onLogout }: { user: Developer | null, isAdmin: boolean, onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(user ? [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Upload App', path: '/upload', icon: Upload },
    ] : []),
    ...(isAdmin ? [
      { name: 'Admin', path: '/admin', icon: ShieldCheck },
    ] : []),
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                <Smartphone size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">DroidMarket</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon && <link.icon size={16} />}
                  {link.name}
                </div>
              </Link>
            ))}
            
            {user || isAdmin ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Join as Developer
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-600 hover:text-zinc-900 p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                >
                  {link.name}
                </Link>
              ))}
              {user || isAdmin ? (
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    Join as Developer
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState<Developer | null>(storage.getCurrentUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(storage.getAdminAuth());

  useEffect(() => {
    storage.initialize();
  }, []);

  const handleLogout = () => {
    storage.setCurrentUser(null);
    storage.setAdminAuth(false);
    setUser(null);
    setIsAdmin(false);
    // State updates will trigger redirects via useEffect in protected pages
  };

  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={(u, admin) => { setUser(u); setIsAdmin(admin); }} />} />
            <Route path="/signup" element={<SignupPage onSignup={(u) => setUser(u)} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/upload" element={<UploadPage user={user} />} />
            <Route path="/admin" element={<AdminPanel isAdmin={isAdmin} />} />
            <Route path="/apps.json" element={<AppsJson />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-zinc-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white">
                    <Smartphone size={14} />
                  </div>
                  <span className="text-lg font-bold">DroidMarket</span>
                </div>
                <p className="text-zinc-500 text-sm">
                  The most trusted independent Android marketplace for developers and users alike.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="#" className="hover:text-emerald-600">Documentation</a></li>
                  <li><Link to="/apps.json" className="hover:text-emerald-600">Public API (apps.json)</Link></li>
                  <li><a href="#" className="hover:text-emerald-600">Telegram Bot Setup</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="#" className="hover:text-emerald-600">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Developer Agreement</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-zinc-100 mt-12 pt-8 text-center text-zinc-400 text-xs">
              &copy; {new Date().getFullYear()} DroidMarket. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
