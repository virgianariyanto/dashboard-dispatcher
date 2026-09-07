'use client';

import React from 'react';
import { 
  Users, 
  UserCheck, 
  Truck, 
  UserX, 
  Package, 
  CheckCircle2, 
} from 'lucide-react';
import { KPIData } from '@/types/dispatcher';

interface KPICardsProps {
  kpi: KPIData;
  onFilterStatus?: (status: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpi, onFilterStatus }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      
      {/* KPI 1: Total Driver */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('Semua')}
        className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-xs transition-all hover:shadow-md cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Driver
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono">{kpi.totalDrivers}</span>
          <span className="text-xs text-slate-500">personil</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>Terdaftar di sistem</span>
          <span className="text-blue-600 font-medium group-hover:underline">Lihat Semua →</span>
        </div>
      </div>

      {/* KPI 2: Driver Ready / Standby */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('Ready')}
        className="bg-white border border-slate-200 hover:border-emerald-400 rounded-xl p-4 shadow-xs transition-all hover:shadow-md cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Driver Ready
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600 font-mono">{kpi.readyDrivers}</span>
          <span className="text-xs text-slate-500">standby</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-700/90 flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Siap ditugaskan
          </span>
          <span className="font-medium group-hover:underline">Filter →</span>
        </div>
      </div>

      {/* KPI 3: Driver Sedang Bertugas (Trip) */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('Trip')}
        className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs transition-all hover:shadow-md cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Sedang Bertugas
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-600 font-mono">{kpi.tripDrivers}</span>
          <span className="text-xs text-slate-500">on trip</span>
        </div>
        <div className="mt-2 text-[11px] text-blue-700/90 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>Dalam rute aktif</span>
          <span className="font-medium group-hover:underline">Filter →</span>
        </div>
      </div>

      {/* KPI 4: Driver Izin / Tidak Masuk / Off */}
      <div 
        onClick={() => onFilterStatus && onFilterStatus('Izin')}
        className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-4 shadow-xs transition-all hover:shadow-md cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Driver Izin / Off
          </span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
            <UserX className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-600 font-mono">{kpi.offOrLeaveDrivers}</span>
          <span className="text-xs text-slate-500">tidak aktif</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>Izin sakit / libur off</span>
          <span className="text-amber-600 font-medium group-hover:underline">Filter →</span>
        </div>
      </div>

      {/* KPI 5: Total Order Hari Ini */}
      <div className="bg-white border border-slate-200 hover:border-purple-300 rounded-xl p-4 shadow-xs transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Total Order
          </span>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-purple-600 font-mono">{kpi.totalOrders}</span>
          <span className="text-xs text-slate-500">paket order</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
          <span className="text-rose-600 font-semibold">{kpi.ordersUnassigned} Unassigned</span>
          <span className="text-blue-600 font-medium">{kpi.ordersInProgress} In-Trip</span>
        </div>
      </div>

      {/* KPI 6: Tugas Selesai & Realisasi Target */}
      <div className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-4 shadow-xs transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Tugas Selesai
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-600 font-mono">{kpi.ordersCompleted}</span>
          <span className="text-xs text-slate-500">/ target {kpi.targetOrders}</span>
        </div>
        <div className="mt-2 border-t border-slate-100 pt-2">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500">Realisasi Target</span>
            <span className="text-emerald-700 font-bold">{kpi.realizationRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, kpi.realizationRate)}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
