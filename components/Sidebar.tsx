'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Tag, 
  CreditCard, 
  ChevronRight,
  ShieldCheck, 
  Package, 
  ClipboardList,
  ClipboardCheck,
  Building2,
  LogOut
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard' 
  | 'drivers' 
  | 'orders' 
  | 'master-status' 
  | 'master-sim-types' 
  | 'master-task-types'
  | 'master-branches';

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
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-40 shadow-xs">
      
      {/* Brand & Logo Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-4 ring-blue-50 shrink-0">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black tracking-tight text-slate-900 truncate">
              DISPATCHER OPS
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-500 truncate">
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500'}`} />
                <span>Dashboard Overview</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Monitoring Driver & Tugas */}
            <button
              onClick={() => onSelectTab('drivers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === 'drivers'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className={`w-4 h-4 ${activeTab === 'drivers' ? 'text-white' : 'text-slate-500'}`} />
                <span>Monitoring Driver</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'drivers' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {driverCount}
              </span>
            </button>

            {/* Monitoring Order */}
            <button
              onClick={() => onSelectTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className={`w-4 h-4 ${activeTab === 'orders' ? 'text-white' : 'text-slate-500'}`} />
                <span>Monitoring Order</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'orders' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {orderCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Section 2: Master Data (Terhubung ke Driver & Order) */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Master Data</span>
          </div>
          <nav className="space-y-1">
            {/* Master Status Driver */}
            <button
              onClick={() => onSelectTab('master-status')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === 'master-status'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tag className={`w-4 h-4 ${activeTab === 'master-status' ? 'text-white' : 'text-amber-500'}`} />
                <span>Master Status</span>
              </div>
              {activeTab === 'master-status' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Master Jenis SIM */}
            <button
              onClick={() => onSelectTab('master-sim-types')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === 'master-sim-types'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className={`w-4 h-4 ${activeTab === 'master-sim-types' ? 'text-white' : 'text-blue-500'}`} />
                <span>Master Jenis SIM</span>
              </div>
              {activeTab === 'master-sim-types' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Master Jenis Tugas */}
            <button
              onClick={() => onSelectTab('master-task-types')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === 'master-task-types'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className={`w-4 h-4 ${activeTab === 'master-task-types' ? 'text-white' : 'text-blue-600'}`} />
                <span>Master Tugas</span>
              </div>
              {activeTab === 'master-task-types' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>

            {/* Master Cabang (Branch) */}
            <button
              onClick={() => onSelectTab('master-branches')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left cursor-pointer ${
                activeTab === 'master-branches'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 ${activeTab === 'master-branches' ? 'text-white' : 'text-indigo-600'}`} />
                <span>Master Cabang</span>
              </div>
              {activeTab === 'master-branches' && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          </nav>
        </div>

      </div>

      {/* Admin User & Database Connection Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2">
        {/* Admin Profile Bar */}
        <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs ring-2 ring-blue-100 shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">Administrator</div>
              <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
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
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
};
