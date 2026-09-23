import { QRItem } from '../types';

export const initialQRItems: QRItem[] = [
  {
    id: '1',
    code: '82937401',
    customerName: 'شركة النور التجارية',
    deviceName: 'جهاز نقاط بيع - POS T1',
    deviceNumber: 'SN-998234',
    notes: 'تم التسليم والربط بنجاح في الفرع الرئيسي',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    size: 250
  },
  {
    id: '2',
    code: '44729105',
    customerName: 'مؤسسة الأفق الذكي',
    deviceName: 'راوتر صناعي 5G',
    deviceNumber: 'RTR-44810',
    notes: 'مخصص للربط السحابي الآمن',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    fgColor: '#2563eb',
    bgColor: '#f8fafc',
    size: 250
  },
  {
    id: '3',
    code: '90382714',
    customerName: 'محمد أحمد العبدالله',
    deviceName: 'جهاز بصمة الحضور',
    deviceNumber: 'FP-2026-X',
    notes: 'تم تثبيته عند مدخل الموظفين',
    createdAt: new Date().toISOString(),
    fgColor: '#059669',
    bgColor: '#ffffff',
    size: 250
  }
];
