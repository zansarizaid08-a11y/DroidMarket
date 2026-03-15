import { useEffect, useState } from 'react';
import { storage } from '../storage';
import { AppEntry } from '../types';

export default function AppsJson() {
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    const allApps = storage.getApps();
    const devs = storage.getDevelopers();
    const liveApps = allApps.filter(a => a.status === 'approved');
    
    const formattedApps = liveApps.map(app => {
      return {
        name: app.name,
        version: app.version,
        category: app.category,
        developer: app.developerName || 'Unknown Developer',
        apk_url: app.apk_url,
        icon_url: app.icon_url,
        status: app.status
      };
    });
    
    setApps(formattedApps);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-mono">apps.json</h1>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold uppercase">Public Endpoint</span>
      </div>
      <div className="bg-zinc-900 rounded-2xl p-6 overflow-x-auto shadow-2xl">
        <pre className="text-emerald-400 font-mono text-sm">
          {JSON.stringify(apps, null, 2)}
        </pre>
      </div>
      <div className="mt-8 p-6 bg-white border border-zinc-200 rounded-2xl">
        <h3 className="font-bold mb-2">How to use this API</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Your Android app should fetch this JSON to display the list of available applications. 
          Only apps with <code className="bg-zinc-100 px-1 rounded text-zinc-900">"status": "approved"</code> are included in this output.
        </p>
        <div className="mt-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100 font-mono text-xs text-zinc-600">
          GET /apps.json
        </div>
      </div>
    </div>
  );
}
