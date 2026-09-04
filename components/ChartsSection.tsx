'use client';

import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  Trophy, 
  Star, 
  Target, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowUpRight 
} from 'lucide-react';
import { Driver, KPIData } from '@/types/dispatcher';

interface ChartsSectionProps {
  drivers: Driver[];
  kpi: KPIData;
  onSelectDriverForHistory: (driver: Driver) => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  drivers,
  kpi,
  onSelectDriverForHistory,
}) => {
  // Sort drivers for Leaderboard Ranking (Poin 6.10)
  const rankedDrivers = [...drivers].sort(
    (a, b) => b.performanceScore - a.performanceScore || b.completedTasks - a.completedTasks
  );

  // Status distributions percentages
  const total = kpi.totalDrivers || 1;
  const readyPct = Math.round((kpi.readyDrivers / total) * 100);
  const tripPct = Math.round((kpi.tripDrivers / total) * 100);
  const waitingPct = Math.round((kpi.waitingAssignmentDrivers / total) * 100);
  const offLeavePct = Math.round((kpi.offOrLeaveDrivers / total) * 100);

  // Order distribution data
  const orderBreakdown = [
    { label: 'Selesai', count: kpi.ordersCompleted, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { label: 'In-Trip / Berjalan', count: kpi.ordersInProgress, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: 'Diterima / Pending', count: kpi.ordersReceived, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { label: 'Belum Ditugaskan', count: kpi.ordersUnassigned, color: 'bg-rose-500', textColor: 'text-rose-400' },
    { label: 'Dibatalkan', count: kpi.ordersCancelled, color: 'bg-slate-600', textColor: 'text-slate-400' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Chart 1: Grafik Status Driver & Ketersediaan Armada */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Distribusi Status Driver
              </h2>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {kpi.totalDrivers} Armada
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Proporsi kesiapan armada untuk operasional penerimaan penugasan baru.
          </p>

          {/* Visual Stacked Progress Bar */}
          <div className="w-full h-4 bg-slate-800 rounded-full flex overflow-hidden p-0.5 gap-0.5 mb-4 shadow-inner">
            <div 
              className="bg-emerald-500 rounded-l-full transition-all duration-500" 
              style={{ width: `${readyPct}%` }}
              title={`Ready: ${readyPct}% (${kpi.readyDrivers} driver)`}
            />
            <div 
              className="bg-blue-500 transition-all duration-500" 
              style={{ width: `${tripPct}%` }}
              title={`Trip: ${tripPct}% (${kpi.tripDrivers} driver)`}
            />
            <div 
              className="bg-amber-500 transition-all duration-500" 
              style={{ width: `${waitingPct}%` }}
              title={`Menunggu: ${waitingPct}% (${kpi.waitingAssignmentDrivers} driver)`}
            />
            <div 
              className="bg-slate-600 rounded-r-full transition-all duration-500" 
              style={{ width: `${offLeavePct}%` }}
              title={`Izin/Off: ${offLeavePct}% (${kpi.offOrLeaveDrivers} driver)`}
            />
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                <span className="text-slate-300 font-medium">Standby / Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400 font-mono">{kpi.readyDrivers} driver</span>
                <span className="text-slate-500">({readyPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
                <span className="text-slate-300 font-medium">Sedang Bertugas (Trip)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-400 font-mono">{kpi.tripDrivers} driver</span>
                <span className="text-slate-500">({tripPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
                <span className="text-slate-300 font-medium">Menunggu Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400 font-mono">{kpi.waitingAssignmentDrivers} driver</span>
                <span className="text-slate-500">({waitingPct}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span className="text-slate-300 font-medium">Izin / Libur / Off</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 font-mono">{kpi.offOrLeaveDrivers} driver</span>
                <span className="text-slate-500">({offLeavePct}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Kesiapan Armada:</span>
          <span className="text-emerald-400 font-semibold font-mono">
            {Math.round(((kpi.readyDrivers + kpi.tripDrivers) / total) * 100)}% Beroperasi
          </span>
        </div>
      </div>

      {/* Chart 2: Grafik Order Harian & Target vs Realisasi (Poin 2.2 & 6.9) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Order & Realisasi Target
              </h2>
            </div>
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Target: {kpi.targetOrders}
            </span>
          </div>

          {/* Perbandingan Target vs Realisasi (Poin 6.9) */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Realisasi Pengiriman Hari Ini</span>
              </div>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {kpi.ordersCompleted} / {kpi.targetOrders} ({kpi.realizationRate}%)
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, kpi.realizationRate)}%` }}
              />
            </div>
          </div>

          {/* Status Breakdown Bars */}
          <div className="space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Rincian Status Order
            </div>
            {orderBreakdown.map((item) => {
              const pct = kpi.totalOrders > 0 ? Math.round((item.count / kpi.totalOrders) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-xs">{item.label}</span>
                    <span className={`font-mono font-semibold ${item.textColor}`}>
                      {item.count} order ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Success Rate Pengiriman:</span>
          <span className="text-emerald-400 font-semibold font-mono">
            {kpi.ordersCompleted > 0 
              ? Math.round((kpi.ordersCompleted / (kpi.ordersCompleted + kpi.ordersCancelled || 1)) * 100) 
              : 100}% Sukses
          </span>
        </div>
      </div>

      {/* Chart 3: Ranking Driver Berdasarkan Performa (Poin 6.10 & 2.5) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Leaderboard Driver
              </h2>
            </div>
            <span className="text-xs text-slate-400">Top 5 Performa</span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Peringkat berdasarkan ketepatan waktu, penyelesaian tugas, dan rating.
          </p>

          <div className="space-y-2.5">
            {rankedDrivers.slice(0, 5).map((driver, index) => {
              const medalColors = [
                'bg-amber-500 text-slate-950 font-bold', // Emas
                'bg-slate-300 text-slate-900 font-bold', // Perak
                'bg-amber-700 text-white font-bold',     // Perunggu
              ];
              const rankBadge = index < 3 ? medalColors[index] : 'bg-slate-800 text-slate-400 font-medium';

              return (
                <div
                  key={driver.id}
                  onClick={() => onSelectDriverForHistory(driver)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-mono ${rankBadge}`}>
                      {index + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden ring-1 ring-slate-600 shrink-0">
                      <img 
                        src={driver.avatarUrl} 
                        alt={driver.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {driver.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{driver.completedTasks} Selesai</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">{driver.onTimeRate}% On-Time</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{driver.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-[10px] text-blue-400 font-mono font-semibold">
                      Skor: {driver.performanceScore}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Standar Minimum Skor: 80</span>
          <span className="text-slate-400 text-[10px]">Klik driver untuk riwayat →</span>
        </div>
      </div>

    </div>
  );
};
