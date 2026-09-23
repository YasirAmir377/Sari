import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, RefreshCw, Download, Copy, Check, Share2, 
  Smartphone, User, Hash, FileText, Palette, Sliders, ShieldCheck, Sparkles,
  Scan, Camera, Upload, CheckCircle2, AlertCircle, X 
} from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Language, QRItem } from '../types';
import { translations } from '../utils/translations';
import { generateQRPngDataUrl, generateQRSvgDataUrl } from '../utils/qrHelper';

interface QRCodeGeneratorProps {
  items: QRItem[];
  lang: Language;
  onSaveRecord: (item: Omit<QRItem, 'id' | 'createdAt'>) => void;
  onNavigateToTable: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  items,
  lang,
  onSaveRecord,
  onNavigateToTable
}) => {
  const t = translations[lang];

  // 18 digit number state
  const [code, setCode] = useState<string>('123456789012345678');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Customization state
  const [size, setSize] = useState<number>(280);
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Customer binding state
  const [customerName, setCustomerName] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');
  const [deviceNumber, setDeviceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI status
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgUrl, setQrSvgUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  // Scanner state
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [matchingItem, setMatchingItem] = useState<QRItem | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  const playSuccessBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}

    if (navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }
  };

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);
    setMatchingItem(null);

    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "gen-scanner-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            handleDetectedCode(decodedText);
            scanner.clear().catch(() => {});
            setIsScanning(false);
          },
          (error) => {}
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(() => {});
      } catch (e) {}
    }
    setIsScanning(false);
  };

  const handleDetectedCode = (codeText: string) => {
    playSuccessBeep();
    const digitsOnly = codeText.replace(/\D/g, '');
    const foundCode = digitsOnly.length >= 18 ? digitsOnly.slice(-18) : codeText;
    
    setScanResult(foundCode);
    const matched = items.find(item => item.code === foundCode || codeText.includes(item.code));
    setMatchingItem(matched || null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const html5QrCode = new Html5Qrcode("gen-scanner-file");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleDetectedCode(decodedText);
    } catch (err) {
      alert(lang === 'ar' ? 'تعذر قراءة رمز QR من الصورة المرفوعة. تأكد من وضوح الصورة.' : 'Could not read QR code from uploaded image.');
    }
  };

  // Validate and generate QR whenever code, colors, or size change
  useEffect(() => {
    if (!/^\d{18}$/.test(code)) {
      setErrorMsg(t.invalidCodeError);
      setQrPngUrl('');
      setQrSvgUrl('');
      return;
    }
    setErrorMsg('');
    generateQRPngDataUrl(code, fgColor, bgColor, size).then(setQrPngUrl);
    generateQRSvgDataUrl(code, fgColor, bgColor, size).then(setQrSvgUrl);
  }, [code, fgColor, bgColor, size, t]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 18);
    setCode(val);
  };

  const handleGenerateRandom = () => {
    const randomNum = Math.floor(100000000000000000 + Math.random() * 900000000000000000).toString();
    setCode(randomNum);
  };

  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const link = document.createElement('a');
    link.href = qrPngUrl;
    link.download = `QR-${code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSvg = () => {
    if (!qrSvgUrl) return;
    const blob = new Blob([qrSvgUrl], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-${code}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code for number: ${code}`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      handleCopyCode();
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{18}$/.test(code)) {
      setErrorMsg(t.invalidCodeError);
      return;
    }

    onSaveRecord({
      code,
      customerName,
      deviceName,
      deviceNumber,
      notes,
      fgColor,
      bgColor,
      size
    });

    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);

    // Reset customer fields
    setCustomerName('');
    setDeviceName('');
    setDeviceNumber('');
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.appSubtitle}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            {t.generator}
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            {lang === 'ar' 
              ? 'أدخل رقماً مكوناً من 18 خانة، وقم بتخصيص الألوان والأحجام، واربطه مباشرة ببيانات الجهاز والزبون مع إمكانية التصدير والطباعة الفورية.'
              : 'Enter an 18-digit number, customize colors and sizes, and bind it directly with device & customer records for instant export and printing.'}
          </p>
        </div>
      </div>

      {savedAlert && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 shadow-sm animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-sm font-bold">{t.savedSuccessfully}</div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Customization & Customer Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Number Input Card */}
          <div className="bg-white dark:bg-[#15243d] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                <span>{t.enter8Digits}</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.generateRandom}</span>
              </button>
            </div>

            <div className="mb-3">
              <input
                type="text"
                maxLength={18}
                value={code}
                onChange={handleCodeChange}
                placeholder="123456789012345678"
                className={`w-full text-center text-lg sm:text-2xl lg:text-3xl font-black font-mono tracking-wider sm:tracking-widest py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border ${
                  errorMsg ? 'border-rose-500 text-rose-600' : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              {errorMsg ? (
                <p className="font-bold text-rose-500">{errorMsg}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.digitHint}</span>
                </p>
              )}
              <div className="font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                {code.length} / 18
              </div>
            </div>
          </div>

          {/* Customization Card */}
          <div className="bg-white dark:bg-[#15243d] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>{t.qrSettings}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Size */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.qrSize} {size}px
                </label>
                <input
                  type="range"
                  min="180"
                  max="400"
                  step="10"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Foreground Color */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.fgColor}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-1 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs font-mono text-slate-500">{fgColor}</span>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.bgColor}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-1 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs font-mono text-slate-500">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Device Binding Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>{t.customerInfoTitle}</span>
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.customerName}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم الزبون الكريم..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.deviceName}
                  </label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="نوع الجهاز (مثال: جهاز استقبال رقمي)..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.deviceNumber}
                  </label>
                  <input
                    type="text"
                    value={deviceNumber}
                    onChange={(e) => setDeviceNumber(e.target.value)}
                    placeholder="SN-123456789..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.notes}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات التركيب أو الضمان..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={!!errorMsg}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t.saveRecord}</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToTable}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  عرض سجل الأجهزة المرفقة &larr;
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: QR Preview Card */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-[#15243d] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg sticky top-24 flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.generator}</span>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                {code.length} / 18 Digit
              </span>
            </div>

            {/* QR Image Box */}
            <div className="w-full aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center p-6 mb-6 group relative overflow-hidden">
              {qrPngUrl ? (
                <div className="relative">
                  <img
                    src={qrPngUrl}
                    alt="QR Code"
                    className="rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              ) : (
                <div className="text-center p-8 text-rose-500 font-bold text-sm">
                  {errorMsg || 'يرجى إدخال 18 رقماً صحيحاً'}
                </div>
              )}
            </div>

            {/* Attached Info Summary if filled */}
            {(customerName || deviceName) && (
              <div className="w-full bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl mb-6 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700/60">
                {customerName && <div className="flex justify-between"><span className="text-slate-500">الزبون:</span><span className="font-bold text-slate-800 dark:text-slate-200">{customerName}</span></div>}
                {deviceName && <div className="flex justify-between"><span className="text-slate-500">الجهاز:</span><span className="font-bold text-slate-800 dark:text-slate-200">{deviceName}</span></div>}
                {deviceNumber && <div className="flex justify-between"><span className="text-slate-500">رقم السيريال:</span><span className="font-bold font-mono text-indigo-600">{deviceNumber}</span></div>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full mb-3">
              <button
                onClick={handleDownloadPng}
                disabled={!qrPngUrl}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadPng}</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!qrSvgUrl}
                className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>{t.downloadSvg}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copyCode}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                <Share2 className="w-4 h-4 text-indigo-500" />
                <span>{t.share}</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Built-in Scanner Section at bottom of Generator Page */}
      <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{t.scannerTitle}</h2>
            <p className="text-xs text-slate-500">{lang === 'ar' ? 'مسح سريع للأكواد عبر الكاميرا أو رفع صورة الباركود والتحقق من بيانات الجهاز والزبون' : 'Quick scan codes via camera or uploaded image & verify data'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          {!isScanning ? (
            <button
              onClick={startScanner}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl text-sm shadow-md transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>{t.startCamera}</span>
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-2xl text-sm shadow-md transition-all"
            >
              <X className="w-5 h-5" />
              <span>{t.stopCamera}</span>
            </button>
          )}

          <label className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-2xl text-sm cursor-pointer transition-all">
            <Upload className="w-5 h-5 text-indigo-500" />
            <span>{t.uploadImage}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div id="gen-scanner-file" className="hidden"></div>

        {isScanning && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-6 flex flex-col items-center">
            <div id="gen-scanner-reader" className="w-full max-w-md overflow-hidden rounded-xl"></div>
          </div>
        )}

        {scanResult && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.scanResult}</h3>
                <p className="font-mono text-xs font-bold text-indigo-600">{scanResult}</p>
              </div>
            </div>

            {matchingItem ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.matchingRecordFound}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
                  <div><span className="text-slate-500">الزبون:</span> <strong className="text-slate-800 dark:text-slate-200">{matchingItem.customerName || '-'}</strong></div>
                  <div><span className="text-slate-500">الجهاز:</span> <strong className="text-slate-800 dark:text-slate-200">{matchingItem.deviceName || '-'}</strong></div>
                  <div><span className="text-slate-500">السيريال:</span> <strong className="font-mono text-indigo-600">{matchingItem.deviceNumber || '-'}</strong></div>
                  <div><span className="text-slate-500">ملاحظات:</span> <span className="text-slate-700 dark:text-slate-300">{matchingItem.notes || '-'}</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{t.noMatchingRecord}</span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
