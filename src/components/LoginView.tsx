import React, { useState } from 'react';
import { Tv, Lock, User, ShieldCheck, Sparkles, AlertCircle, Radio } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface LoginViewProps {
  onLoginSuccess: () => void;
  lang: Language;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, lang }) => {
  const t = translations[lang];
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const savedUsername = localStorage.getItem('qrgen_admin_username') || 'abdsari';
    const savedPassword = localStorage.getItem('qrgen_admin_password') || '1234321';

    setTimeout(() => {
      if (username.trim() === savedUsername && password === savedPassword) {
        localStorage.setItem('qrgen_is_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError(lang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Cairo','Inter',sans-serif]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-md w-full bg-[#111c2e] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/30 transform hover:scale-105 transition-transform">
            <Tv className="w-10 h-10 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{lang === 'ar' ? 'بث أرضي مباشر لقنوات المباريات' : 'Live Match Terrestrial Broadcasting'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            {lang === 'ar' ? 'شركة الساري للبث الأرضي' : 'Al-Sari Terrestrial Broadcasting'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {lang === 'ar' ? 'نظام إدارة الاشتراكات وباركودات الأجهزة للبطولات' : 'Subscriptions & Device Barcode Management System'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'ar' ? 'اسم المستخدم (Admin)' : 'Username'}</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="abdsari"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl text-sm shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>{lang === 'ar' ? 'تسجيل الدخول للنظام' : 'Login to System'}</span>
              </>
            )}
          </button>

        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
          <p>Al-Sari Broadcasting © 2026 • Secure Access Control</p>
        </div>

      </div>

    </div>
  );
};
