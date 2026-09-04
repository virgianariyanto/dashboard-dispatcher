'use client';

import React from 'react';
import { 
  X, 
  History, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  Hourglass, 
  XCircle, 
  Star, 
  Phone, 
  Truck 
} from 'lucide-react';
import { Driver, TaskHistoryItem } from '@/types/dispatcher';

interface DriverHistoryModalProps {
  driver: Driver | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask?: (orderNumber: string) => void;
}

export const DriverHistoryModal: React.FC<DriverHistoryModalProps> = ({
  driver,
  isOpen,
  onClose,
  onCompleteTask,
}) => {
  if (!isOpen || !driver) return null;

  const getTaskStatusBadge = (status: TaskHistoryItem['status']) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'Berjalan':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/30">
            <PlayCircle className="w-3 h-3" />
            Berjalan (In-Trip)
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
            <Hourglass className="w-3 h-3" />
            Pending / Antrean
          </span>
        );
      case 'Cancel':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Dibatalkan
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Riwayat Penugasan: {driver.name}</span>
                <span className="text-xs font-mono font-normal text-slate-400">({driver.id})</span>
              </h3>
              <p className="text-xs text-slate-400">Detail riwayat order dan rekam jejak pengantaran hari ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Driver Summary Bar */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <img 
              src={driver.avatarUrl} 
              alt={driver.name} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700" 
            />
            <div>
              <div className="font-bold text-white">{driver.name}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{driver.phone}</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Armada & Plat:</span>
            <span className="font-semibold text-slate-200">{driver.vehicleType.split('(')[0]}</span>
            <span className="block font-mono text-blue-400 text-[11px]">{driver.plateNumber}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Performa & Rating:</span>
            <div className="flex items-center gap-1 font-bold text-amber-400 font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{driver.rating.toFixed(1)} / 5.0</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">{driver.onTimeRate}% Tepat Waktu</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Total Rekap Tugas:</span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-emerald-400 font-bold">{driver.completedTasks} Selesai</span>
              <span>•</span>
              <span className="text-blue-400 font-bold">{driver.inProgressTasks} In-Trip</span>
            </div>
            <span className="text-[10px] text-slate-400">Total: {driver.totalTasks} order</span>
          </div>
        </div>

        {/* Task List Timeline */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {driver.taskHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Belum ada riwayat penugasan untuk driver ini hari ini.
            </div>
          ) : (
            driver.taskHistory.map((task, idx) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400">{task.orderNumber}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-semibold text-slate-200">{task.customer}</span>
                  </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{task.startTime} {task.endTime !== '-' ? `→ ${task.endTime}` : '(Sedang Berjalan)'}</span>
                      </div>
                      {getTaskStatusBadge(task.status)}

                      {task.status === 'Berjalan' && onCompleteTask && (
                        <button
                          onClick={() => onCompleteTask(task.orderNumber)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-all shadow-sm active:scale-95 ml-1"
                          title="Tandai tugas selesai"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selesaikan</span>
                        </button>
                      )}
                    </div>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Pickup:</span>
                      <span>{task.pickupLocation}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Dropoff:</span>
                      <span>{task.dropoffLocation}</span>
                    </div>
                  </div>
                </div>

                {task.notes && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                    Catatan: "{task.notes}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
