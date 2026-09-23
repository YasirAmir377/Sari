import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { ExcelTableView } from './components/ExcelTableView';
import { CustomerDevicesTable } from './components/CustomerDevicesTable';
import { StatsView } from './components/StatsView';
import { SettingsModal } from './components/SettingsModal';
import { LoginView } from './components/LoginView';
import { Language, QRItem } from './types';
import { initialQRItems } from './utils/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'excelTable' | 'table' | 'stats' | 'settings'>('generator');
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('qrgen_is_authenticated') === 'true';
  });

  // Persistent state for items
  const [items, setItems] = useState<QRItem[]>(() => {
    const saved = localStorage.getItem('qrgen_pro_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialQRItems;
      }
    }
    return initialQRItems;
  });

  // Language state
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('qrgen_pro_lang') as Language) || 'ar';
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('qrgen_pro_dark');
    return saved ? JSON.parse(saved) : true;
  });

  // Save items to localStorage
  useEffect(() => {
    localStorage.setItem('qrgen_pro_items', JSON.stringify(items));
  }, [items]);

  // Save language and update document attributes
  useEffect(() => {
    localStorage.setItem('qrgen_pro_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  // Save dark mode and update HTML class
  useEffect(() => {
    localStorage.setItem('qrgen_pro_dark', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => setIsAuthenticated(true)}
        lang={lang}
      />
    );
  }

  const handleSaveRecord = (newItemData: Omit<QRItem, 'id' | 'createdAt'>) => {
    const newItem: QRItem = {
      ...newItemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setItems([newItem, ...items]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleDeleteAll = () => {
    setItems([]);
  };

  const handleUpdateItem = (updated: QRItem) => {
    setItems(items.map(i => i.id === updated.id ? updated : i));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111c2e] text-slate-900 dark:text-slate-100 flex flex-col font-['Cairo','Inter',sans-serif]">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        totalRecordsCount={items.length}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        {activeTab === 'generator' && (
          <QRCodeGenerator
            items={items}
            lang={lang}
            onSaveRecord={handleSaveRecord}
            onNavigateToTable={() => setActiveTab('table')}
          />
        )}

        {activeTab === 'excelTable' && (
          <ExcelTableView
            items={items}
            setItems={setItems}
            lang={lang}
          />
        )}

        {activeTab === 'table' && (
          <CustomerDevicesTable
            items={items}
            lang={lang}
            onDeleteItem={handleDeleteItem}
            onDeleteAll={handleDeleteAll}
            onUpdateItem={handleUpdateItem}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            items={items}
            lang={lang}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            items={items}
            setItems={setItems}
            lang={lang}
            setLang={setLang}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onLogout={() => {
              localStorage.removeItem('qrgen_is_authenticated');
              setIsAuthenticated(false);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 QRGen Pro. {lang === 'ar' ? 'جميع الحقوق محفوظة. نظام توليد وإدارة الأكواد وربط الأجهزة.' : 'All rights reserved. QR Generation & Device Binding System.'}</p>
      </footer>

    </div>
  );
}
