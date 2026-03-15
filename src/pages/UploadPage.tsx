import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Smartphone, Image as ImageIcon, FileText, AlertCircle, CheckCircle2, Loader2, Info, Send, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../storage';
import { Developer, AppEntry } from '../types';
import { TELEGRAM_CONFIG, APP_CATEGORIES } from '../constants';

export default function UploadPage({ user }: { user: Developer | null }) {
  const navigate = useNavigate();
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(APP_CATEGORIES[0]);
  const [version, setVersion] = useState('1.0');
  const [permissions, setPermissions] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('png')) {
        setError('Icon must be in PNG format');
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width !== img.height) {
          setError('Icon must be a square image');
          return;
        }
        if (img.width < 512 || img.height < 512) {
          // User recommended 512x512, but we'll just warn or allow if it's square
          // For now, let's just ensure it's square.
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setIconPreview(reader.result as string);
          setIconFile(file);
          setError('');
        };
        reader.readAsDataURL(file);
      };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.apk')) {
        setError('Invalid file type. Please upload a valid .apk file');
        setApkFile(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File size is too large. Maximum limit is 50MB');
        setApkFile(null);
        return;
      }
      setApkFile(file);
      setError('');
    }
  };

  const getTelegramFilePath = async (fileId: string, retries = 3): Promise<string | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getFile?file_id=${fileId}`);
        const data = await response.json();
        if (data.ok && data.result.file_path) {
          return data.result.file_path;
        }
      } catch (e) {
        console.error(`Retry ${i + 1} failed for fileId ${fileId}`, e);
      }
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return null;
  };

  const uploadToTelegram = async () => {
    if (!apkFile || !iconFile) {
      setError('Please select both an APK file and an icon image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Step 1: Upload APK and Icon simultaneously
      const apkFormData = new FormData();
      apkFormData.append('chat_id', TELEGRAM_CONFIG.CHAT_ID);
      apkFormData.append('document', apkFile);
      apkFormData.append('caption', `📦 New App Submission: ${appName}\nVersion: ${version}\nDeveloper: ${user?.name}`);

      const iconFormData = new FormData();
      iconFormData.append('chat_id', TELEGRAM_CONFIG.CHAT_ID);
      iconFormData.append('photo', iconFile);
      iconFormData.append('caption', `🖼️ Icon for ${appName}`);

      setUploadProgress(20);

      // Simultaneous upload
      const [apkResponse, iconResponse] = await Promise.all([
        fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendDocument`, {
          method: 'POST',
          body: apkFormData,
        }),
        fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: iconFormData,
        })
      ]);

      const apkResult = await apkResponse.json();
      const iconResult = await iconResponse.json();

      // Check if uploads were successful
      if (!apkResult.ok || !iconResult.ok) {
        const errorMsg = (!apkResult.ok ? apkResult.description : iconResult.description) || 'Telegram API upload failed';
        throw new Error(errorMsg);
      }

      // If we are here, uploads succeeded!
      setUploadProgress(60);

      // Step 2: Extract file_ids
      const apkFileId = apkResult.result.document.file_id;
      const iconFileId = iconResult.result.photo[iconResult.result.photo.length - 1].file_id;

      // Step 3: Get file paths with retry logic
      const [apkFilePath, iconFilePath] = await Promise.all([
        getTelegramFilePath(apkFileId),
        getTelegramFilePath(iconFileId)
      ]);

      setUploadProgress(90);

      // Step 4: Generate final links
      const apkUrl = apkFilePath 
        ? `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.BOT_TOKEN}/${apkFilePath}`
        : '';
      const iconUrl = iconFilePath
        ? `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.BOT_TOKEN}/${iconFilePath}`
        : '';

      // Save App Entry
      const appId = `APP_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const newApp: AppEntry = {
        appId,
        developerId: user!.developerId,
        developerName: user!.name,
        name: appName,
        description,
        version,
        category,
        icon: iconUrl || iconPreview, // Fallback to preview if iconUrl failed
        icon_url: iconUrl,
        apk_url: apkUrl,
        screenshots: screenshots.length > 0 ? screenshots : [`https://picsum.photos/seed/${appId}_1/400/800`],
        telegramFileId: apkFileId,
        downloadUrl: apkUrl,
        status: 'approved',
        uploadDate: new Date().toISOString(),
        permissions
      };

      storage.saveApp(newApp);
      setUploadProgress(100);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during upload');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Submit New Application</h1>
        <p className="text-zinc-500 mt-2">Fill in the details below to publish your app to DroidMarket.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 -z-10" />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              step >= s ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-400 border-2 border-zinc-200'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-8 md:p-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 text-sm rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 size={20} />
            App uploaded successfully and stored in Telegram.
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-emerald-600" /> Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 ml-1">App Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="My Awesome App"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 ml-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  >
                    {APP_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  placeholder="Tell users what your app does..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 ml-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="1.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 ml-1">App Icon (Square, 512x512 PNG recommended)</label>
                  <div className="flex items-center gap-4">
                    {iconPreview ? (
                      <div className="relative group">
                        <img 
                          src={iconPreview} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-2xl object-cover border border-zinc-200"
                        />
                        <button 
                          onClick={() => { setIconPreview(''); setIconFile(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => iconInputRef.current?.click()}
                        className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                      >
                        <ImageIcon size={24} />
                        <span className="text-[10px] mt-1">Upload</span>
                      </button>
                    )}
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/png"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                    <div className="text-xs text-zinc-400">
                      Upload a high-quality square PNG icon for your app.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 ml-1">Permissions Description</label>
                <input
                  type="text"
                  value={permissions}
                  onChange={(e) => setPermissions(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="e.g. Camera, Location, Storage"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!appName || !description || !iconFile}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 mt-4 disabled:opacity-50"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Upload className="text-emerald-600" /> APK Upload
              </h2>

              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
                <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
                <div className="text-sm text-emerald-800">
                  <p className="font-bold mb-1">Secure Telegram Distribution</p>
                  <p>Your APK will be securely uploaded to our Telegram distribution channel. This ensures high-speed downloads for your users.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 ml-1">APK File (Max 50MB)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".apk"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`w-full py-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all ${apkFile ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200 group-hover:border-emerald-300 group-hover:bg-emerald-50/30'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${apkFile ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-400'}`}>
                        <Smartphone size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-zinc-900">
                          {apkFile ? apkFile.name : 'Click or drag APK file here'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {apkFile ? `${(apkFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Only .apk files are allowed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!apkFile}
                  className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
                >
                  Review Submission
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" /> Final Review
              </h2>

              <div className="bg-zinc-50 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={iconPreview || `https://picsum.photos/seed/${appName}/100/100`}
                    alt="Icon"
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{appName}</h3>
                    <p className="text-sm text-zinc-500">{category} • v{version}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-zinc-200">
                  <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                    {description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <FileText size={12} /> {apkFile?.name} ({(apkFile!.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>

              {isUploading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-emerald-600" size={18} />
                      {uploadProgress < 100 ? 'Uploading to Telegram...' : 'Finalizing...'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-400 text-center">Please do not close this window until the process is complete.</p>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={uploadToTelegram}
                    className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Confirm & Upload
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
