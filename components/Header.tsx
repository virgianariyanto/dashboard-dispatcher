'use client';

import React from 'react';
import { 
  PlusCircle, 
  Download, 
  Bell, 
  MapPin, 
  RefreshCw 
} from 'lucide-react';
import { TimeFrame } from '@/types/dispatcher';
import { BRANCH_LIST } from '@/data/initialData';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  category?: string;
  showTimeFrame?: boolean;
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  timeFrame: TimeFrame;
  onChangeTimeFrame: (tf: TimeFrame) => void;
  unassignedCount: number;
  readyDriverCount: number;
  isSyncing?: boolean;
  onRefresh?: () => void;
  onOpenNewOrder: () => void;
  onOpenExport: () => void;
  onOpenUnassignedList?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard Overview',
  subtitle,
  category = 'Operasional',
  showTimeFrame = false,
  selectedBranch,
  onSelectBranch,
  timeFrame,
  onChangeTimeFrame,
  unassignedCount,
  readyDriverCount,
  isSyncing = false,
  onRefresh,
  onOpenNewOrder,
  onOpenExport,
  onOpenUnassignedList,
}) => {
  const isAlertCondition = unassignedCount > 0 && unassignedCount >= readyDriverCount;

  return (
    <header className="bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800/80 sticky top-0 z-30 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left: Clean Breadcrumb & Page Title (Tanpa logo/badge ganda) */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <span className="font-semibold text-blue-400 uppercase tracking-wider text-[10px]">
                {category}
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 font-medium">{title}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right: Focused Operational Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* Cabang Filter */}
            <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700/80 px-2.5 py-1.5 text-xs text-slate-200 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium text-xs"
                aria-label="Pilih Cabang"
              >
                {BRANCH_LIST.map((b) => (
                  <option key={b} value={b} className="bg-slate-800 text-slate-200">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* TimeFrame (Harian, Mingguan, Bulanan) */}
            {showTimeFrame && (
              <div className="inline-flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/80 text-xs">
                {(['harian', 'mingguan', 'bulanan'] as TimeFrame[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => onChangeTimeFrame(tf)}
                    className={`px-2 py-1 rounded-md font-medium capitalize text-[11px] transition-all ${
                      timeFrame === tf
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}

            {/* Refresh Data Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isSyncing}
                title="Sinkronkan data dengan PostgreSQL"
                className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-all text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Unassigned Notification Bell */}
            <button
              onClick={onOpenUnassignedList}
              title={`${unassignedCount} order belum memiliki driver`}
              className={`relative p-2 rounded-lg border transition-all text-xs ${
                isAlertCondition
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                  : unassignedCount > 0
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/90 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              {unassignedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {unassignedCount}
                </span>
              )}
            </button>

            {/* Export Laporan */}
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-medium transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Input Order Baru */}
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Order Baru</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
