'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Printer, Download, CheckCircle, Calendar, Users, ClipboardList } from 'lucide-react';
import { Driver, KPIData, TimeFrame, Order } from '@/types/dispatcher';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  orders?: Order[];
  kpi: KPIData;
  currentTimeFrame: TimeFrame;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  drivers,
  orders = [],
  kpi,
  currentTimeFrame,
}) => {
  const [reportType, setReportType] = useState<'drivers' | 'orders'>('drivers');
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [reportPeriod, setReportPeriod] = useState<TimeFrame>(currentTimeFrame);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const BOM = '\uFEFF';

    if (reportType === 'drivers') {
      const headers = [
        'No',
        'ID Driver',
        'Nama Driver',
        'Jenis SIM',
        'Status Driver',
        'Jam Mulai',
        'Jam Selesai',
        'Total Tugas',
        'Tugas Selesai',
        'Tugas Berjalan',
        'Tugas Pending',
        'Tugas Cancel',
        'Ketepatan Waktu (%)',
        'Rating Bintang',
        'Skor Performa',
        'Keterangan',
      ];

      const rows = drivers.map((d, idx) => [
        idx + 1,
        `"${d.id}"`,
        `"${d.name}"`,
        `"${d.simType || '-'}"`,
        `"${d.status}"`,
        `"${d.startTime}"`,
        `"${d.endTime}"`,
        d.totalTasks,
        d.completedTasks,
        d.inProgressTasks,
        d.pendingTasks,
        d.cancelledTasks,
        d.onTimeRate,
        d.rating,
        d.performanceScore,
        `"${(d.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        BOM +
        `"REKAP MONITORING DISPATCHER DRIVER - PERIODE ${reportPeriod.toUpperCase()}"\n` +
        `"Waktu Ekspor: ${new Date().toLocaleString('id-ID')}"\n\n` +
        headers.join(',') +
        '\n' +
        rows.map((r) => r.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Laporan_Driver_${reportPeriod}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        'No',
        'No Order',
        'Nama Customer',
        'Lokasi Penjemputan',
        'Lokasi Pengantaran',
        'Jenis Tugas',
        'Prioritas',
        'Driver Bertugas',
        'Status Pengiriman',
        'Target Pengiriman',
        'Waktu Dibuat',
      ];

      const rows = orders.map((o, idx) => [
        idx + 1,
        `"${o.orderNumber}"`,
        `"${o.customer}"`,
        `"${(o.pickupLocation || '').replace(/"/g, '""')}"`,
        `"${(o.dropoffLocation || '').replace(/"/g, '""')}"`,
        `"${o.taskType || '-'}"`,
        `"${o.priority || 'Normal'}"`,
        `"${o.assignedDriverName || 'Belum Ditugaskan'}"`,
        `"${o.status}"`,
        `"${o.targetDeliveryTime || '-'}"`,
        `"${o.createdAt || '-'}"`,
      ]);

      const csvContent =
        BOM +
        `"REKAP MONITORING ORDER & LOGISTIK - PERIODE ${reportPeriod.toUpperCase()}"\n` +
        `"Waktu Ekspor: ${new Date().toLocaleString('id-ID')}"\n\n` +
        headers.join(',') +
        '\n' +
        rows.map((r) => r.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Laporan_Order_${reportPeriod}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1500);
  };

  const handlePrintPDF = () => {
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Laporan Dispatcher</h3>
              <p className="text-xs text-slate-500">Ekspor rekap data driver atau order ke Excel / PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">

          {/* Tipe Laporan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Jenis Data yang Diekspor
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setReportType('drivers')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  reportType === 'drivers'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <div className="font-bold text-xs">Kinerja Driver</div>
                  <div className="text-[10px] text-slate-500">Status & Performa</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('orders')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  reportType === 'orders'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 ring-1 ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <div className="text-left">
                  <div className="font-bold text-xs">Data Order</div>
                  <div className="text-[10px] text-slate-500">Tugas & Pengiriman</div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Format Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Pilih Format Dokumen
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  format === 'excel'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs">Excel (.CSV)</span>
                <span className="text-[10px] text-slate-500 text-center">Kompatibel Excel & Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  format === 'pdf'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Printer className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-xs">Cetak / PDF</span>
                <span className="text-[10px] text-slate-500 text-center">Format siap cetak resmi</span>
              </button>
            </div>
          </div>

          {/* Periode Rekap */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Periode Rekap Laporan
            </label>
            <div className="flex gap-2">
              {(['harian', 'mingguan', 'bulanan'] as TimeFrame[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setReportPeriod(p)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all ${
                    reportPeriod === p
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Jumlah Data:</span>
              <span className="font-mono font-bold text-slate-900">
                {reportType === 'drivers' ? `${drivers.length} Driver` : `${orders.length} Order`}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Periode Terpilih:</span>
              <span className="font-medium text-blue-600 font-semibold capitalize">{reportPeriod}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">
                {reportType === 'drivers' ? 'Total Tugas Selesai:' : 'Status Order Selesai:'}
              </span>
              <span className="font-mono font-bold text-emerald-600">
                {reportType === 'drivers'
                  ? `${kpi.ordersCompleted} Tugas`
                  : `${orders.filter((o) => o.status === 'Selesai').length} Selesai`}
              </span>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-center text-xs font-semibold flex items-center justify-center gap-1.5 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>File laporan berhasil diekspor!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            {format === 'excel' ? (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Excel (.CSV)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrintPDF}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Buka Print / Simpan PDF</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
