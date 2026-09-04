'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Driver } from '@/types/dispatcher';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  onConfirmDelete: (driverId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  driver,
  onConfirmDelete,
}) => {
  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-rose-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Driver</h3>
              <p className="text-xs text-rose-300">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 text-xs text-slate-300">
          <p>
            Apakah Anda yakin ingin menghapus data driver <strong className="text-white">{driver.name}</strong> ({driver.id}) dari database PostgreSQL?
          </p>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Plat Kendaraan:</span>
              <span className="font-mono font-bold text-white">{driver.plateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cabang:</span>
              <span className="text-slate-200">{driver.branch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Riwayat Tugas:</span>
              <span className="font-mono text-emerald-400">{driver.totalTasks} order</span>
            </div>
          </div>

          <p className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            ⚠️ Order aktif yang saat ini ditugaskan ke driver ini akan secara otomatis dikembalikan ke status <em>Belum Ditugaskan (Unassigned)</em>.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-800/40 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(driver.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-600/30 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus Driver</span>
          </button>
        </div>

      </div>
    </div>
  );
};
