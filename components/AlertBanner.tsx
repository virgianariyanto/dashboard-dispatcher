'use client';

import React from 'react';
import { AlertCircle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

interface AlertBannerProps {
  unassignedCount: number;
  readyDriverCount: number;
  onOpenNewOrder: () => void;
  onScrollToTable: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  unassignedCount,
  readyDriverCount,
  onScrollToTable,
}) => {
  const isHighDemandLowSupply = unassignedCount > 0 && readyDriverCount <= 1;
  const hasUnassigned = unassignedCount > 0;

  if (!hasUnassigned && !isHighDemandLowSupply) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Peringatan Kritis: Order Tinggi vs Driver Standby Terbatas */}
      {isHighDemandLowSupply && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0 mt-0.5 border border-rose-200">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-2xs">
                    PERINGATAN KRITIS DISPATCHER
                  </span>
                  <span className="text-xs text-rose-700 font-semibold">
                    Rasio Armada Berisiko
                  </span>
                </div>
                <p className="text-sm font-semibold text-rose-900 mt-1">
                  Volume order unassigned ({unassignedCount} order) tinggi, namun driver status Ready hanya tersisa{' '}
                  <strong className="text-rose-600 underline font-bold">{readyDriverCount} driver</strong>.
                </p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Segera hubungi driver status Menunggu Assignment / Izin atau batasi penerimaan order express untuk mencegah keterlambatan SLA.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={onScrollToTable}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <span>Cek Driver Standby</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Order Belum Memiliki Driver */}
      {!isHighDemandLowSupply && hasUnassigned && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-900">
                  Terdapat {unassignedCount} Order yang belum ditugaskan ke driver.
                </p>
                <p className="text-xs text-amber-700">
                  Ada {readyDriverCount} driver standby yang siap menerima penugasan segera.
                </p>
              </div>
            </div>

            <button
              onClick={onScrollToTable}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs transition-all shrink-0 cursor-pointer"
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
