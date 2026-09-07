'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Tag, 
  Car, 
  Building2, 
  Database, 
  ChevronRight,
  ShieldCheck,
  Package,
  ClipboardList,
  LogOut
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard' 
  | 'drivers' 
  | 'orders'
  | 'master-status' 
  | 'master-vehicles' 
  | 'master-branches'
  | 'master-cargo-types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  driverCount: number;
  orderCount?: number;
  unassignedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  driverCount,
  orderCount = 0,
  unassignedCount,
}) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 select-none z-40">
      
      {/* Brand & Logo Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20 shrink-0">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black tracking-tight text-white truncate">
              DISPATCHER OPS
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Fleet Monitoring System
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs">
        
        {/* Section 1: Operasional */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operasional
          </div>
          <nav className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-slate-300" />
                <span>Dashboard Overview</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Monitoring Driver & Tugas */}
            <button
              onClick={() => onSelectTab('drivers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left ${
                activeTab === 'drivers'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-slate-300" />
                <span>Monitoring Driver</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800/80 text-emerald-400 border border-emerald-500/20">
                {driverCount}
              </span>
            </button>

            {/* Monitoring Order */}
            <button
              onClick={() => onSelectTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Monitoring Order</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800/80 text-blue-400 border border-blue-500/20">
                {orderCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Section 2: Master Data (Terhubung ke Driver) */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Master Data</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
              PostgreSQL
            </span>
          </div>
          <nav className="space-y-1">
            {/* Master Status Driver */}
            <button
              onClick={() => onSelectTab('master-status')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left ${
                activeTab === 'master-status'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Master Status</span>
              </div>
              {activeTab === 'master-status' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Master Jenis Kendaraan */}
            <button
              onClick={() => onSelectTab('master-vehicles')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left ${
                activeTab === 'master-vehicles'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-emerald-400" />
                <span>Master Kendaraan</span>
              </div>
              {activeTab === 'master-vehicles' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Master Cabang */}
            <button
              onClick={() => onSelectTab('master-branches')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left ${
                activeTab === 'master-branches'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Master Cabang</span>
              </div>
              {activeTab === 'master-branches' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Master Jenis Muatan */}
            <button
              onClick={() => onSelectTab('master-cargo-types')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left ${
                activeTab === 'master-cargo-types'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-orange-400" />
                <span>Master Muatan</span>
              </div>
              {activeTab === 'master-cargo-types' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          </nav>
        </div>

      </div>

      {/* Admin User & Database Connection Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        {/* Admin Profile Bar */}
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/20 shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-white truncate">Administrator</div>
              <div className="text-[10px] text-blue-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="truncate">Admin Mode</span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                } catch (err) {
                  console.error(err);
                } finally {
                  window.location.href = '/login';
                }
              }
            }}
            title="Keluar (Logout)"
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Database Connection Status */}
        <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
              <span>PostgreSQL 18</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[9px] text-slate-400 truncate font-mono">
              dashboard_dispatcher
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
};
