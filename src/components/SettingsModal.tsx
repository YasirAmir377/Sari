import React, { useRef, useState } from 'react';
import { Settings, Download, Upload, Moon, Sun, Globe, Shield, RefreshCw, User, Lock, LogOut } from 'lucide-react';
import { Language, QRItem } from '../types';
import { translations } from '../utils/translations';

interface SettingsModalProps {
  items: QRItem[];
  setItems: React.Dispatch<React.SetStateAction<QRItem[]>>;
  lang: Language;
  setLang: (l: Language) => void;
  darkMode: boolean;
  setDarkMode: (dm: boolean) => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  items,
  setItems,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  onLogout
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adminUser, setAdminUser] = useState<string>(() => {
    return localStorage.getItem('qrgen_admin_username') || 'abdsari';
  });
  const [adminPass, setAdminPass] = useState<string>(() => {
    return localStorage.getItem('qrgen_admin_password') || '1234321';
  });
  const [savedCredAlert, setSavedCredAlert] = useState<boolean>(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('qrgen_admin_username', adminUser.trim() || 'abdsari');
    localStorage.setItem('qrgen_admin_password', adminPass || '1234321');
    setSavedCredAlert(true);
    setTimeout(() => setSavedCredAlert(false), 3000);
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `qrgen_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setItems(parsed);
            alert(lang === 'ar' ? 'تم استعادة النسخة الاحتياطية بنجاح!' : 'Backup restored successfully!');
          }
        } catch (error) {
          alert(lang === 'ar' ? 'ملف النسخة الاحتياطية غير صالح' : 'Invalid backup file');
        }
      };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>{t.settings}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {lang === 'ar' ? 'إعدادات النظام والنسخ الاحتياطي' : 'System Settings & Cloud Backup'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'ar' ? 'إدارة تفضيلات المظهر، اللغة، وتصدير/استعادة النسخ الاحتياطية بأمان.' : 'Manage theme, language preferences, and secure JSON backups.'}
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Backup & Restore Card */}
        <div className="bg-white dark:bg-[#15243d] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>{t.cloudBackup}</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            {lang === 'ar' ? 'قم بتصدير جميع بيانات الأجهزة والعملاء والأكواد إلى ملف آمن، أو استعادتها في أي وقت.' : 'Export all device and customer records into a secure backup file or restore them anytime.'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportBackup}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-2xl text-xs transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>{t.importBackup}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </button>
          </div>
        </div>

        {/* Theme & Language Card */}
        <div className="bg-white dark:bg-[#15243d] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>{t.themeSettings}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                    {darkMode ? t.darkMode : t.lightMode}
                  </span>
                  <span className="text-xs text-slate-400">تغيير مظهر التطبيق</span>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  darkMode ? 'translate-x-0' : '-translate-x-6'
                }`} />
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-indigo-500" />
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">{t.language}</span>
                  <span className="text-xs text-slate-400">{lang === 'ar' ? 'العربية' : 'English'}</span>
                </div>
              </div>
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                {lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Credentials Settings Card */}
        <div className="bg-white dark:bg-[#15243d] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>{lang === 'ar' ? 'إعدادات حساب المسؤول (Admin)' : 'Admin Account Settings'}</span>
            </h3>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            {lang === 'ar' ? 'قم بتغيير اسم المستخدم وكلمة المرور الخاصة بدخول النظام.' : 'Update administrator username and password for system login.'}
          </p>

          {savedCredAlert && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold">
              {lang === 'ar' ? 'تم تحديث بيانات المسؤول بنجاح!' : 'Admin credentials updated successfully!'}
            </div>
          )}

          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{lang === 'ar' ? 'اسم المستخدم (Admin)' : 'Admin Username'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-colors"
              >
                {lang === 'ar' ? 'حفظ بيانات الدخول' : 'Save Credentials'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
