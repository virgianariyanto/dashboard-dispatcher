'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Download, 
  Bell, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';
import { TimeFrame } from '@/types/dispatcher';
import { BRANCH_LIST } from '@/data/initialData';

interface HeaderProps {
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  timeFrame: TimeFrame;
  onChangeTimeFrame: (tf: TimeFrame) => void;
  unassignedCount: number;
  readyDriverCount: number;
  onOpenNewOrder: () => void;
  onOpenExport: () => void;
  onOpenUnassignedList?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedBranch,
  onSelectBranch,
  timeFrame,
  onChangeTimeFrame,
  unassignedCount,
  readyDriverCount,
  onOpenNewOrder,
  onOpenExport,
  onOpenUnassignedList,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAlertCondition = unassignedCount > 0 && unassignedCount >= readyDriverCount;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Dashboard Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  DASHBOARD MONITORING DRIVER
                </h1>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                  DISPATCHER OPS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistem Monitoring Ketersediaan Armada, Aktivitas Order & Kinerja Driver
              </p>
            </div>
          </div>

          {/* Controls: Branch Filter, TimeFrame, Real-time Clock, & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            
            {/* Real-time Clock & Date */}
            <div className="hidden xl:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentDate || 'Memuat...'}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentTime || '00:00:00 WIB'}</span>
              </div>
            </div>

            {/* Cabang Filter */}
            <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700 px-2.5 py-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-2 font-medium"
                aria-label="Pilih Cabang"
              >
                {BRANCH_LIST.map((branch) => (
                  <option key={branch} value={branch} className="bg-slate-800 text-slate-200">
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            {/* Periode Rekap (Harian, Mingguan, Bulanan - Poin 6.11) */}
            <div className="inline-flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              {(['harian', 'mingguan', 'bulanan'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => onChangeTimeFrame(tf)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-all ${
                    timeFrame === tf
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Quick Unassigned Indicator Bell */}
            <button
              onClick={onOpenUnassignedList}
              title={`${unassignedCount} order belum memiliki driver`}
              className={`relative p-2 rounded-lg border transition-all ${
                isAlertCondition
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : unassignedCount > 0
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unassignedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {unassignedCount}
                </span>
              )}
            </button>

            {/* Export Laporan (Poin 6.6) */}
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Laporan</span>
            </button>

            {/* Input Order Baru (Poin 6.4) */}
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Order Baru</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
