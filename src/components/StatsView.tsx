import React from 'react';
import { BarChart3, QrCode, Users, HardDrive, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { Language, QRItem } from '../types';
import { translations } from '../utils/translations';

interface StatsViewProps {
  items: QRItem[];
  lang: Language;
}

export const StatsView: React.FC<StatsViewProps> = ({ items, lang }) => {
  const t = translations[lang];

  const totalCodes = items.length;
  const customersCount = new Set(items.map(i => i.customerName).filter(Boolean)).size;
  const devicesCount = items.filter(i => i.deviceName).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{t.statistics}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {lang === 'ar' ? 'لوحة المؤشرات والتقارير التحليلية' : 'Analytics & Performance Dashboard'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {lang === 'ar' ? 'نظرة شاملة على الأكواد المنشأة والأجهزة المربوطة وحالة التخزين.' : 'Overview of generated codes, linked devices and storage status.'}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white dark:bg-[#15243d] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.totalGenerated}</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalCodes}</h3>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3" /> نشط في النظام
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#15243d] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.activeDevices}</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{devicesCount}</h3>
            <span className="text-xs text-violet-600 font-medium mt-0.5 block">
              {customersCount} زبون مختلف
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#15243d] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.storageUsed}</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">~{(JSON.stringify(items).length / 1024).toFixed(1)} KB</h3>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> آمن محلياً
            </span>
          </div>
        </div>

      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-[#15243d] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>{lang === 'ar' ? 'آخر العمليات والسجلات المضافة' : 'Recent Added Records'}</span>
        </h3>

        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">لا توجد سجلات حديثة.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                    QR
                  </div>
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.code}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {item.customerName || 'بدون زبون'} {item.deviceName ? `• ${item.deviceName}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
