import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { QRItem } from '../types';

export async function generateQRSvgDataUrl(text: string, fgColor = '#000000', bgColor = '#ffffff', size = 250): Promise<string> {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      color: {
        dark: fgColor,
        light: bgColor,
      },
      width: size,
      margin: 2,
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  } catch (err) {
    console.error('Error generating SVG QR:', err);
    return '';
  }
}

export async function generateQRPngDataUrl(text: string, fgColor = '#000000', bgColor = '#ffffff', size = 300): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      color: {
        dark: fgColor,
        light: bgColor,
      },
      width: size,
      margin: 2,
    });
  } catch (err) {
    console.error('Error generating PNG QR:', err);
    return '';
  }
}

export function exportToExcel(items: QRItem[]) {
  const data = items.map(item => ({
    'رقم الكود (8 أرقام)': item.code,
    'اسم الزبون': item.customerName || '-',
    'اسم الجهاز': item.deviceName || '-',
    'رقم/سيريال الجهاز': item.deviceNumber || '-',
    'ملاحظات': item.notes || '-',
    'تاريخ الإنشاء': new Date(item.createdAt).toLocaleString('ar-SA')
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الأجهزة والعملاء');
  XLSX.writeFile(workbook, `qr_devices_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportToPdf(items: QRItem[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Al-Sari Terrestrial Broadcasting - Subscriptions Barcodes', 105, 15, { align: 'center' });

  let y = 25;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (y > 265) {
      doc.addPage();
      y = 20;
    }

    // Background box for each item
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, y, 190, 22, 2, 2, 'F');

    // Generate QR code image for PDF
    try {
      const qrDataUrl = await generateQRPngDataUrl(item.code, item.fgColor || '#000000', item.bgColor || '#ffffff', 200);
      if (qrDataUrl) {
        doc.addImage(qrDataUrl, 'PNG', 174, y + 1, 20, 20);
      }
    } catch (e) {
      console.error('Error adding QR image to PDF:', e);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`#${i + 1} - ${item.code}`, 15, y + 13);

    y += 26;
  }

  doc.save(`qr_barcodes_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function exportQrImages(items: QRItem[]) {
  if (items.length === 0) return;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const dataUrl = await generateQRPngDataUrl(item.code, item.fgColor || '#000000', item.bgColor || '#ffffff', 400);
    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR-${item.code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Small delay between downloads to prevent browser blocking
      await new Promise(res => setTimeout(res, 250));
    }
  }
}

