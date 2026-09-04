'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

interface AlertBannerProps {
  unassignedCount: number;
  readyDriverCount: number;
  onOpenNewOrder: () => void;
  onScrollToTable: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  unassignedCount,
  readyDriverCount,
  onOpenNewOrder,
  onScrollToTable,
}) => {
  // Poin 6.8: Peringatan ketika jumlah order tinggi tetapi driver standby terbatas
  const isHighDemandLowSupply = unassignedCount > 0 && readyDriverCount <= 1;
  const hasUnassigned = unassignedCount > 0;

  if (!hasUnassigned && !isHighDemandLowSupply) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Peringatan Kritis: Order Tinggi vs Driver Standby Terbatas (Poin 6.8) */}
      {isHighDemandLowSupply && (
        <div className="bg-gradient-to-r from-rose-900/40 via-rose-950/50 to-red-900/30 border border-rose-500/50 rounded-xl p-4 shadow-lg backdrop-blur-sm animate-pulse-subtle">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0 mt-0.5 border border-rose-500/30">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded">
                    PERINGATAN KRITIS DISPATCHER
                  </span>
                  <span className="text-xs text-rose-300 font-semibold">
                    Rasio Armada Berisiko
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100 mt-1">
                  Volume order unassigned ({unassignedCount} order) tinggi, namun driver status Ready hanya tersisa{' '}
                  <strong className="text-rose-400 underline">{readyDriverCount} driver</strong>.
                </p>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Segera hubungi driver status Menunggu Assignment / Izin atau batasi penerimaan order express untuk mencegah keterlambatan SLA.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={onScrollToTable}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
              >
                <span>Cek Driver Standby</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Order Belum Memiliki Driver (Poin 6.7) */}
      {!isHighDemandLowSupply && hasUnassigned && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-200">
                  Terdapat {unassignedCount} Order yang belum ditugaskan ke driver.
                </p>
                <p className="text-xs text-slate-400">
                  Ada {readyDriverCount} driver standby yang siap menerima penugasan segera.
                </p>
              </div>
            </div>

            <button
              onClick={onScrollToTable}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tugaskan ke Driver</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
