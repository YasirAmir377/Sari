import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, Camera, Plus, Trash2, Download, FileSpreadsheet, 
  FileText, Check, QrCode, X, Sparkles, RefreshCw, ScanLine, Upload, Edit3 
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { Language, QRItem } from '../types';
import { translations } from '../utils/translations';
import { generateQRPngDataUrl, exportToExcel, exportToPdf, exportQrImages } from '../utils/qrHelper';

interface ExcelTableViewProps {
  items: QRItem[];
  setItems: React.Dispatch<React.SetStateAction<QRItem[]>>;
  lang: Language;
}

export const ExcelTableView: React.FC<ExcelTableViewProps> = ({
  items,
  setItems,
  lang
}) => {
  const t = translations[lang];
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [newManualCode, setNewManualCode] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  const startCameraScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "excel-scanner-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            const cleaned = decodedText.trim();
            if (cleaned) {
              addCodeToTable(cleaned);
              scanner.clear().catch(() => {});
              setIsScanning(false);
            }
          },
          (error) => {}
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setIsScanning(false);
      }
    }, 100);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(() => {});
      } catch (e) {}
    }
    setIsScanning(false);
  };

  const addCodeToTable = (codeVal: string) => {
    if (!codeVal) return;
    const newItem: QRItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      code: codeVal,
      customerName: 'زبون جديد',
      deviceName: 'جهاز مسجل',
      deviceNumber: 'SN-' + Math.floor(100000 + Math.random() * 900000),
      notes: 'تمت الإضافة عبر النظام التلقائي',
      createdAt: new Date().toISOString(),
      fgColor: '#4f46e5',
      bgColor: '#ffffff',
      size: 200
    };
    setItems(prev => [newItem, ...prev]);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualCode.trim()) return;
    addCodeToTable(newManualCode.trim());
    setNewManualCode('');
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

        const newItems: QRItem[] = [];
        data.forEach((row: any) => {
          if (!row || !Array.isArray(row)) return;
          // Look for number/code in the row columns
          const val = row[0] !== undefined ? row[0] : row[1];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            const codeStr = String(val).trim();
            if (codeStr !== 'الرقم' && codeStr !== 'code' && codeStr !== 'QR-Code - الباركود') {
              newItems.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                code: codeStr,
                customerName: 'مستورد من Excel',
                deviceName: 'جهاز مضاف',
                deviceNumber: 'SN-' + Math.floor(100000 + Math.random() * 900000),
                notes: 'تم استيراد الرقم وتوليد الباركود أوتوماتيكياً',
                createdAt: new Date().toISOString(),
                fgColor: '#4f46e5',
                bgColor: '#ffffff',
                size: 200
              });
            }
          }
        });

        if (newItems.length > 0) {
          setItems(prev => [...newItems, ...prev]);
          alert(lang === 'ar' ? `تم استيراد ${newItems.length} رقم بنجاح وتوليد الباركود لها فوراً!` : `Successfully imported ${newItems.length} codes and generated QR codes!`);
        } else {
          alert(lang === 'ar' ? 'لم يتم العثور على أرقام صالحة للاستيراد في الملف.' : 'No valid numbers found in file.');
        }
      } catch (err) {
        console.error(err);
        alert(lang === 'ar' ? 'خطأ في قراءة ملف الإكسل. تأكد من صحة الملف.' : 'Error reading Excel file.');
      }
      if (e.target) e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleUpdateCode = (id: string, newCode: string) => {
    setItems(items.map(i => i.id === id ? { ...i, code: newCode } : i));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>الساري للبث الارضي نظام (Qr-Code)</span>
          </div>
        </div>
      </div>

      {/* Action Controls: Camera Capture, Excel Import & Manual Add */}
      <div className="bg-white dark:bg-[#15243d] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!isScanning ? (
            <button
              onClick={startCameraScanner}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-2xl text-sm shadow-md transition-all justify-center"
            >
              <Camera className="w-5 h-5 animate-pulse" />
              <span>{lang === 'ar' ? '📷 تصوير الرقم بالكاميرا' : '📷 Capture Camera'}</span>
            </button>
          ) : (
            <button
              onClick={stopCameraScanner}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-5 rounded-2xl text-sm shadow-md transition-all justify-center"
            >
              <X className="w-5 h-5" />
              <span>{lang === 'ar' ? 'إيقاف الكاميرا' : 'Stop Camera'}</span>
            </button>
          )}

          {/* Import Excel Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-2xl text-sm shadow-md transition-all justify-center"
          >
            <Upload className="w-5 h-5" />
            <span>{lang === 'ar' ? '📥 استيراد من ملف Excel' : '📥 Import Excel'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelImport}
            className="hidden"
          />

          <form onSubmit={handleManualAdd} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newManualCode}
              onChange={(e) => setNewManualCode(e.target.value)}
              placeholder={lang === 'ar' ? 'أدخل الرقم يدوياً...' : 'Enter number...'}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono w-44 sm:w-56"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-2xl text-sm shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة' : 'Add'}</span>
            </button>
          </form>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={() => exportQrImages(items)}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ar' ? '🖼️ تصدير الصور' : '🖼️ Export Images'}</span>
          </button>
          <button
            onClick={() => exportToExcel(items)}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.exportExcel}</span>
          </button>
          <button
            onClick={() => exportToPdf(items)}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>{t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Live Scanner Box */}
      {isScanning && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border-2 border-purple-500 shadow-xl mb-8 flex flex-col items-center animate-fade-in">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold mb-4">
            <ScanLine className="w-5 h-5 animate-spin" />
            <span>{lang === 'ar' ? 'قم بتوجيه الكاميرا إلى الرقم أو الباركود...' : 'Point camera to number or barcode...'}</span>
          </div>
          <div id="excel-scanner-reader" className="w-full max-w-md overflow-hidden rounded-2xl"></div>
        </div>
      )}

      {/* Excel Table */}
      <div className="bg-white dark:bg-[#15243d] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
        {items.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Table className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              {lang === 'ar' ? 'الجدول فارغ حالياً' : 'Table is currently empty'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar' ? 'استخدم زر استيراد ملف إكسل أو تصوير الكاميرا لبدء العمل أوتوماتيكياً.' : 'Use Excel import or camera capture to start.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4"
              >
                {/* 1. الرقم في الأعلى */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-400">#{index + 1} - {lang === 'ar' ? 'الرقم (18 خانة)' : 'Number'}</span>
                  </div>
                  <input
                    type="text"
                    maxLength={18}
                    value={item.code}
                    onChange={(e) => handleUpdateCode(item.id, e.target.value.replace(/\D/g, '').slice(0, 18))}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm sm:text-base font-mono font-bold tracking-wider sm:tracking-widest text-purple-600 dark:text-purple-400 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* 2. وتحته مربع الرمز، وأمامه تعديل أو حذف */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  
                  {/* مربع الرمز */}
                  <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <TableRowQRRender code={item.code} fgColor={item.fgColor} bgColor={item.bgColor} />
                  </div>

                  {/* أمام الرمز: أيقونات التعديل والحذف فوق بعضها */}
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          const newCode = prompt(lang === 'ar' ? 'أدخل الرقم الجديد (18 رقم):' : 'Enter new 18-digit code:', item.code);
                          if (newCode) {
                            const cleaned = newCode.replace(/\D/g, '').slice(0, 18);
                            if (cleaned.length === 18) {
                              handleUpdateCode(item.id, cleaned);
                            } else {
                              alert(lang === 'ar' ? 'يجب أن يتكون الرقم من 18 خانة בדיוק' : 'Must be exactly 18 digits');
                            }
                          }
                        }}
                        className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800 flex items-center justify-center"
                        title={lang === 'ar' ? 'تعديل الرقم' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl transition-colors border border-rose-200 dark:border-rose-800 flex items-center justify-center"
                        title={lang === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#15243d] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              {lang === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا الباركود؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this barcode? This action cannot be undone.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-2xl text-sm transition-colors"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  handleDeleteItem(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-2xl text-sm transition-colors shadow-md"
              >
                {lang === 'ar' ? 'نعم، حذف' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const TableRowQRRender: React.FC<{ code: string; fgColor?: string; bgColor?: string }> = ({ code, fgColor = '#000000', bgColor = '#ffffff' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (code) {
      generateQRPngDataUrl(code, fgColor, bgColor, 150).then(setDataUrl);
    }
  }, [code, fgColor, bgColor]);

  return dataUrl ? (
    <img src={dataUrl} alt="QR Code" className="w-32 h-32 object-contain rounded-lg" />
  ) : (
    <div className="w-32 h-32 flex items-center justify-center text-xs text-slate-400">جاري التوليد...</div>
  );
};
