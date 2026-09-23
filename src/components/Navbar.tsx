import React from 'react';
import { QrCode, Users, Scan, BarChart3, Settings, Moon, Sun, Globe, Wifi, Table } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  activeTab: 'generator' | 'excelTable' | 'table' | 'stats' | 'settings';
  setActiveTab: (tab: 'generator' | 'excelTable' | 'table' | 'stats' | 'settings') => void;
  lang: Language;
  setLang: (l: Language) => void;
  darkMode: boolean;
  setDarkMode: (dm: boolean) => void;
  totalRecordsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  totalRecordsCount
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#111c2e]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">{t.appName}</span>
              <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">{t.appSubtitle}</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'generator'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{t.generator}</span>
            </button>

            <button
              onClick={() => setActiveTab('excelTable')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'excelTable'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-4 h-4 text-purple-600" />
              <span>{t.excelTableTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.recordsTable}</span>
              {totalRecordsCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {totalRecordsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'stats'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.statistics}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.settings}</span>
            </button>
          </nav>

          {/* Right Controls: Dark Mode, Language */}
          <div className="flex items-center gap-2.5">

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title="تغيير اللغة / Change Language"
            >
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="تغيير المظهر"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-[#15243d] border-t border-slate-200 dark:border-slate-800 py-2.5 px-2">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${activeTab === 'generator' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <QrCode className="w-5 h-5" />
          <span>{t.generator}</span>
        </button>

        <button
          onClick={() => setActiveTab('excelTable')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${activeTab === 'excelTable' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'}`}
        >
          <Table className="w-5 h-5" />
          <span>الجدول</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`flex flex-col items-center gap-1 text-xs font-medium relative ${activeTab === 'table' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <Users className="w-5 h-5" />
          <span>{t.recordsTable}</span>
          {totalRecordsCount > 0 && (
            <span className="absolute -top-1 right-2 bg-indigo-600 text-white text-[10px] px-1 rounded-full">
              {totalRecordsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${activeTab === 'stats' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>{t.statistics}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 text-xs font-medium ${activeTab === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
        >
          <Settings className="w-5 h-5" />
          <span>{t.settings}</span>
        </button>
      </div>
    </header>
  );
};
