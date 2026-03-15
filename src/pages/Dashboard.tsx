import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, Smartphone, Clock, CheckCircle2, XCircle, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { storage } from '../storage';
import { Developer, AppEntry } from '../types';

export default function Dashboard({ user }: { user: Developer | null }) {
  const [apps, setApps] = useState<AppEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const allApps = storage.getApps();
    const userApps = allApps.filter(a => a.developerId === user.developerId);
    setApps(userApps);
  }, [user, navigate]);

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={12} /> Live
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
          <div className="flex items-center gap-2 text-zinc-500 mt-1">
            <span className="text-sm font-mono bg-zinc-100 px-2 py-0.5 rounded">ID: {user.developerId}</span>
            <span className="text-zinc-300">•</span>
            <span className="text-sm">Joined {new Date(user.joinDate).toLocaleDateString()}</span>
          </div>
        </div>
        <Link
          to="/upload"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={20} />
          Upload New App
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="text-zinc-500 text-sm font-medium mb-1">Total Apps</div>
          <div className="text-3xl font-bold">{apps.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="text-zinc-500 text-sm font-medium mb-1">Live Apps</div>
          <div className="text-3xl font-bold text-emerald-600">
            {apps.filter(a => a.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="text-zinc-500 text-sm font-medium mb-1">Pending Review</div>
          <div className="text-3xl font-bold text-amber-600">
            {apps.filter(a => a.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Apps List */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <h2 className="font-bold">Your Published Apps</h2>
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Latest Submissions</span>
        </div>
        
        {apps.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mx-auto mb-4">
              <Smartphone size={32} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">No apps yet</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
              Start by uploading your first Android application to the marketplace.
            </p>
            <Link
              to="/upload"
              className="inline-block mt-6 text-emerald-600 font-semibold hover:underline"
            >
              Upload your first app &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {apps.map((app) => (
              <div key={app.appId} className="p-6 hover:bg-zinc-50 transition-colors group">
                <div className="flex items-start gap-4">
                  <img
                    src={app.icon || 'https://picsum.photos/seed/app/100/100'}
                    alt={app.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-100 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-zinc-900 truncate">{app.name}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-1 mb-2">
                      {app.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Smartphone size={12} /> v{app.version}
                      </span>
                      <span>•</span>
                      <span>{app.category}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(app.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={app.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Download APK"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-emerald-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Need help with your submission?</h3>
          <p className="text-emerald-100 max-w-md">
            Check our developer guidelines to ensure your app meets our quality and security standards for a faster review process.
          </p>
        </div>
        <button className="relative z-10 px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg">
          Read Guidelines
        </button>
        
        {/* Decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
