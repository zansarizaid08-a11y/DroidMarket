import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../storage';
import { Developer } from '../types';

export default function LoginPage({ onLogin }: { onLogin: (dev: Developer | null, isAdmin: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
      if (password === 'admin123') { // Simple admin password for demo
        storage.setAdminAuth(true);
        onLogin(null, true);
        navigate('/admin');
      } else {
        setError('Invalid admin password');
      }
      return;
    }

    const developers = storage.getDevelopers();
    const dev = developers.find(d => d.email === email);

    if (!dev) {
      setError('Account not found');
      return;
    }

    if (dev.password !== password) {
      setError('Incorrect password');
      return;
    }

    storage.setCurrentUser(dev);
    onLogin(dev, false);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50"
      >
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg transition-colors ${isAdminMode ? 'bg-zinc-900 shadow-zinc-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
            {isAdminMode ? <ShieldCheck size={32} /> : <Smartphone size={32} />}
          </div>
          <h1 className="text-2xl font-bold">{isAdminMode ? 'Admin Login' : 'Developer Login'}</h1>
          <p className="text-zinc-500 text-sm mt-2">
            {isAdminMode ? 'Access the marketplace control panel' : 'Manage your apps and submissions'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isAdminMode && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-4 text-white font-semibold rounded-xl transition-all shadow-lg mt-4 flex items-center justify-center gap-2 group ${isAdminMode ? 'bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
          >
            Login
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center text-sm">
          {!isAdminMode && (
            <div className="text-zinc-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-600 font-semibold hover:underline">
                Sign up here
              </Link>
            </div>
          )}
          <button
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setError('');
            }}
            className="text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {isAdminMode ? 'Switch to Developer Login' : 'Switch to Admin Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
