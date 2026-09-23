import React, { useState } from 'react';
import { 
  Users, Search, Download, FileSpreadsheet, FileText, 
  Trash2, Eye, QrCode, Smartphone, User, Hash, Calendar, Edit3, X, Check 
} from 'lucide-react';
import { Language, QRItem } from '../types';
import { translations } from '../utils/translations';
import { exportToExcel, exportToPdf, generateQRPngDataUrl } from '../utils/qrHelper';

interface CustomerDevicesTableProps {
  items: QRItem[];
  lang: Language;
  onDeleteItem: (id: string) => void;
  onDeleteAll: () => void;
  onUpdateItem: (item: QRItem) => void;
}

export const CustomerDevicesTable: React.FC<CustomerDevicesTableProps> = ({
  items,
  lang,
  onDeleteItem,
  onDeleteAll,
  onUpdateItem
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<QRItem | null>(null);
  const [editingItem, setEditingItem] = useState<QRItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState<boolean>(false);

  // Filter items based on search term
  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(term) ||
      (item.customerName && item.customerName.toLowerCase().includes(term)) ||
      (item.deviceName && item.deviceName.toLowerCase().includes(term)) ||
      (item.deviceNumber && item.deviceNumber.toLowerCase().includes(term)) ||
      (item.notes && item.notes.toLowerCase().includes(term))
    );
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateItem(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>{t.recordsTable}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {lang === 'ar' ? 'سجل الأجهزة والعملاء المرتبطين' : 'Linked Devices & Customer Registry'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar' 
              ? `إجمالي السجلات المسجلة: ${items.length} جهاز` 
              : `Total registered records: ${items.length} devices`}
          </p>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportToExcel(items)}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
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

          {items.length > 0 && (
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold px-3 py-2.5 rounded-xl text-xs transition-colors"
              title={t.deleteAll}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#15243d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-12 pl-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#15243d] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">{t.noRecords}</h3>
            <p className="text-xs text-slate-500">جرب البحث بكلمة أخرى أو قم بإنشاء رموز جديدة من صفحة المولد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-4 px-6">{lang === 'ar' ? 'رقم الكود (18 رقم)' : 'Code (18 Digits)'}</th>
                  <th className="py-4 px-6">اسم الزبون</th>
                  <th className="py-4 px-6">اسم الجهاز</th>
                  <th className="py-4 px-6">رقم / سيريال الجهاز</th>
                  <th className="py-4 px-6">ملاحظات</th>
                  <th className="py-4 px-6">التاريخ</th>
                  <th className="py-4 px-6 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      <span className="bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900 text-xs sm:text-sm tracking-wider sm:tracking-widest">
                        {item.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {item.customerName || <span className="text-slate-400 font-normal">-</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                      {item.deviceName || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {item.deviceNumber || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                      {item.notes || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedItemForModal(item)}
                          className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title={t.viewQr}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                          title={t.edit}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View QR Code Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative text-center">
            <button
              onClick={() => setSelectedItemForModal(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">تفاصيل رمز الاستجابة</h3>
            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-6 bg-indigo-50 dark:bg-indigo-950 py-1 px-3 rounded-full inline-block">
              {selectedItemForModal.code}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-center mb-6">
              <QRImageRender item={selectedItemForModal} />
            </div>

            <div className="space-y-2 text-right bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-xs">
              <div className="flex justify-between"><span className="text-slate-500">اسم الزبون:</span><span className="font-bold">{selectedItemForModal.customerName || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">اسم الجهاز:</span><span className="font-bold">{selectedItemForModal.deviceName || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">رقم الجهاز:</span><span className="font-bold font-mono">{selectedItemForModal.deviceNumber || '-'}</span></div>
              {selectedItemForModal.notes && <div className="flex justify-between"><span className="text-slate-500">ملاحظات:</span><span>{selectedItemForModal.notes}</span></div>}
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">تعديل بيانات السجل</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">رقم الكود (8 أرقام)</label>
                <input
                  type="text"
                  maxLength={8}
                  value={editingItem.code}
                  onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">اسم الزبون</label>
                <input
                  type="text"
                  value={editingItem.customerName}
                  onChange={(e) => setEditingItem({ ...editingItem, customerName: e.target.value })}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">اسم الجهاز</label>
                <input
                  type="text"
                  value={editingItem.deviceName}
                  onChange={(e) => setEditingItem({ ...editingItem, deviceName: e.target.value })}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">رقم/سيريال الجهاز</label>
                <input
                  type="text"
                  value={editingItem.deviceNumber}
                  onChange={(e) => setEditingItem({ ...editingItem, deviceNumber: e.target.value })}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">ملاحظات</label>
                <input
                  type="text"
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Record Delete Confirmation Modal */}
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
              {lang === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this record? This action cannot be undone.'}
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
                  onDeleteItem(deleteConfirmId);
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

      {/* Delete All Records Confirmation Modal */}
      {confirmDeleteAll && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#15243d] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {lang === 'ar' ? 'تأكيد حذف كافة السجلات' : 'Confirm Delete All'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              {lang === 'ar' ? 'تحذير: سيتم حذف جميع السجلات والباركودات نهائياً. هل أنت متأكد؟' : 'Warning: All records and barcodes will be permanently deleted. Are you sure?'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteAll(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-2xl text-sm transition-colors"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteAll();
                  setConfirmDeleteAll(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-2xl text-sm transition-colors shadow-md"
              >
                {lang === 'ar' ? 'نعم، حذف الكل' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper component for modal QR render
const QRImageRender: React.FC<{ item: QRItem }> = ({ item }) => {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    generateQRPngDataUrl(item.code, item.fgColor || '#000', item.bgColor || '#fff', 240).then(setUrl);
  }, [item]);

  return url ? <img src={url} alt="QR" className="rounded-xl shadow-md" /> : <div>جاري التحميل...</div>;
};
