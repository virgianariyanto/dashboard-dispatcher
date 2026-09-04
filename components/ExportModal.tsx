'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Printer, Download, CheckCircle, Calendar } from 'lucide-react';
import { Driver, KPIData, TimeFrame } from '@/types/dispatcher';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  kpi: KPIData;
  currentTimeFrame: TimeFrame;
  selectedBranch: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  drivers,
  kpi,
  currentTimeFrame,
  selectedBranch,
}) => {
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [reportPeriod, setReportPeriod] = useState<TimeFrame>(currentTimeFrame);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    // Generate CSV data formatted for Excel with UTF-8 BOM
    const headers = [
      'No',
      'ID Driver',
      'Nama Driver',
      'Plat Nomor',
      'Jenis Kendaraan',
      'Cabang Operasi',
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
      `"${d.plateNumber}"`,
      `"${d.vehicleType}"`,
      `"${d.branch}"`,
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
      `"${d.notes.replace(/"/g, '""')}"`,
    ]);

    // Prepend UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent =
      BOM +
      `"REKAP MONITORING DISPATCHER DRIVER - PERIODE ${reportPeriod.toUpperCase()}"\n` +
      `"Cabang: ${selectedBranch} | Waktu Ekspor: ${new Date().toLocaleString('id-ID')}"\n\n` +
      headers.join(',') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Laporan_Dispatcher_${selectedBranch.replace(/\s+/g, '_')}_${reportPeriod}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Laporan Dispatcher</h3>
              <p className="text-xs text-slate-400">Ekspor rekap data monitoring driver ke Excel atau PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Format Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pilih Format Dokumen
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  format === 'excel'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-xs">Microsoft Excel (.CSV)</span>
                <span className="text-[10px] text-slate-400 text-center">Kompatibel penuh Excel & Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  format === 'pdf'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300 ring-1 ring-blue-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Printer className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-xs">Cetak / PDF Dokumen</span>
                <span className="text-[10px] text-slate-400 text-center">Format siap cetak dan arsip resmi</span>
              </button>
            </div>
          </div>

          {/* Periode Rekap (Poin 6.11) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
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
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Preview */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 space-y-1.5 text-slate-300">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Total Baris Driver:</span>
              <span className="font-mono font-bold text-white">{drivers.length} Driver</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Cabang Terpilih:</span>
              <span className="font-medium text-blue-400">{selectedBranch}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Total Tugas Terdistribusi:</span>
              <span className="font-mono font-bold text-emerald-400">{kpi.ordersCompleted} Selesai</span>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>File laporan berhasil diekspor!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            {format === 'excel' ? (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Excel (.CSV)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrintPDF}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
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
