'use client';

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Download, 
  Bell, 
  MapPin, 
  RefreshCw,
  LogOut
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      setIsLoggingOut(true);
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        window.location.href = '/login';
      }
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left: Clean Breadcrumb & Page Title */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <span className="font-semibold text-blue-600 uppercase tracking-wider text-[10px]">
                {category}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600 font-medium">{title}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right: Focused Operational Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* Cabang Filter */}
            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="bg-transparent text-slate-700 focus:outline-none cursor-pointer pr-1 font-medium text-xs"
                aria-label="Pilih Cabang"
              >
                {BRANCH_LIST.map((b) => (
                  <option key={b} value={b} className="bg-white text-slate-700">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* TimeFrame (Harian, Mingguan, Bulanan) */}
            {showTimeFrame && (
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                {(['harian', 'mingguan', 'bulanan'] as TimeFrame[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => onChangeTimeFrame(tf)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize text-[11px] transition-all cursor-pointer ${
                      timeFrame === tf
                        ? 'bg-white text-blue-600 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
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
                title="Sinkronkan data"
                className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all text-xs shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Unassigned Notification Bell */}
            <button
              onClick={onOpenUnassignedList}
              title={`${unassignedCount} order belum memiliki driver`}
              className={`relative p-2 rounded-lg border transition-all text-xs cursor-pointer shadow-2xs ${
                isAlertCondition
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : unassignedCount > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              {unassignedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {unassignedCount}
                </span>
              )}
            </button>

            {/* Export Laporan */}
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Input Order Baru */}
            <button
              onClick={onOpenNewOrder}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Order Baru</span>
            </button>

            {/* Separator & Admin Profile + Logout */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-200 gap-2">
              <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-xs ring-1 ring-blue-100 shrink-0">
                  A
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-bold text-slate-800">Admin</div>
                  <div className="text-[9px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Super Admin
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Keluar dari sistem (Logout)"
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <LogOut className={`w-3.5 h-3.5 text-rose-500 ${isLoggingOut ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
