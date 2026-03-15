import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, Trash2, Smartphone, ExternalLink, Search, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../storage';
import { AppEntry } from '../types';

export default function AdminPanel({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    setApps(storage.getApps());
  }, [isAdmin, navigate]);

  const handleStatusChange = (appId: string, status: 'approved' | 'rejected' | 'pending') => {
    storage.updateAppStatus(appId, status);
    setApps(storage.getApps());
  };

  const handleDelete = (appId: string) => {
    if (window.confirm('Are you sure you want to delete this app submission?')) {
      storage.deleteApp(appId);
      setApps(storage.getApps());
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                         app.developerId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-zinc-900" size={32} />
            Admin Review Panel
          </h1>
          <p className="text-zinc-500 mt-1">Review and manage marketplace submissions.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-xl text-sm font-mono text-zinc-600">
          Total Submissions: {apps.length}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by app name or developer ID..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1 border border-zinc-200 rounded-2xl">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                filter === f ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Table/List */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Application</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Developer</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <AnimatePresence>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={32} className="text-zinc-200" />
                        <p>No submissions found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <motion.tr
                      key={app.appId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.icon}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-zinc-900">{app.name}</div>
                            <div className="text-xs text-zinc-400">v{app.version} • {app.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-600">{app.developerId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-500">{new Date(app.uploadDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {app.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(app.appId, 'approved')}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(app.appId, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <a
                            href={app.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Download APK"
                          >
                            <ExternalLink size={18} />
                          </a>
                          <button
                            onClick={() => handleDelete(app.appId)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-6 bg-zinc-900 rounded-3xl text-white flex items-center gap-6">
        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldCheck className="text-emerald-500" />
        </div>
        <div>
          <h3 className="font-bold">Security & Compliance</h3>
          <p className="text-sm text-zinc-400">
            As an administrator, ensure all APKs are scanned for malware and comply with our developer terms before approval.
          </p>
        </div>
      </div>
    </div>
  );
}
