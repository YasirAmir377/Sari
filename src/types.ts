export type Language = 'ar' | 'en';

export interface QRItem {
  id: string;
  code: string; // 8 digit number
  customerName: string;
  deviceName: string;
  deviceNumber: string;
  notes: string;
  createdAt: string;
  fgColor: string;
  bgColor: string;
  size: number;
}

export interface AppSettings {
  language: Language;
  darkMode: boolean;
  defaultFgColor: string;
  defaultBgColor: string;
  defaultSize: number;
}
