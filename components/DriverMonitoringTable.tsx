'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Hourglass, 
  XCircle, 
  History, 
  PlusCircle, 
  Star, 
  MoreVertical,
  ChevronDown,
  UserPlus,
  Edit,
  Trash2
} from 'lucide-react';
import { Driver, DriverStatus } from '@/types/dispatcher';

interface DriverMonitoringTableProps {
  drivers: Driver[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectDriverForHistory: (driver: Driver) => void;
  onQuickAssign: (driver: Driver) => void;
  onChangeDriverStatus: (driverId: string, newStatus: DriverStatus) => void;
  onOpenAddDriver: () => void;
  onEditDriver: (driver: Driver) => void;
  onDeleteDriver: (driver: Driver) => void;
}

export const DriverMonitoringTable: React.FC<DriverMonitoringTableProps> = ({
  drivers,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onSelectDriverForHistory,
  onQuickAssign,
  onChangeDriverStatus,
  onOpenAddDriver,
  onEditDriver,
  onDeleteDriver,
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const statusOptions: { label: string; value: string }[] = [
    { label: 'Semua Status', value: 'Semua' },
    { label: 'Ready / Standby', value: 'Ready' },
    { label: 'Sedang Bertugas', value: 'Trip' },
    { label: 'Menunggu Assignment', value: 'Menunggu Assignment' },
    { label: 'Izin / Tidak Masuk', value: 'Izin' },
    { label: 'Off / Libur', value: 'Off' },
  ];

  // Helper for status badge styling
  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Standby / Ready
          </span>
        );
      case 'Trip':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Sedang Bertugas
          </span>
        );
      case 'Menunggu Assignment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Menunggu Assignment
          </span>
        );
      case 'Izin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Izin / Tidak Masuk
          </span>
        );
      case 'Off':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Off / Libur
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-md overflow-hidden">
      
      {/* Table Header & Controls (Poin 6.1 & 6.2) */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Tabel Monitoring Driver & Tugas
            </h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {drivers.length} Driver Ditampilkan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau status ketersediaan, jam kerja, pembagian tugas harian, serta kelola data armada driver.
          </p>
        </div>

        {/* Filter Controls: Search & Status Dropdown & Tambah Driver */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box (Poin 6.2) */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama driver / ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 text-xs focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Pill (Poin 6.1) */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={selectedStatus}
              onChange={(e) => onSelectStatus(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
              aria-label="Filter Status"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Tambah Driver Baru */}
          <button
            onClick={onOpenAddDriver}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Driver</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <th className="py-3.5 px-4">Driver</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-3">Jam Kerja</th>
              <th className="py-3.5 px-3 text-center">Tugas</th>
              <th className="py-3.5 px-3 text-center text-emerald-400">Selesai</th>
              <th className="py-3.5 px-3 text-center text-blue-400">Berjalan</th>
              <th className="py-3.5 px-3 text-center text-amber-400">Pending</th>
              <th className="py-3.5 px-3 text-center text-rose-400">Cancel</th>
              <th className="py-3.5 px-3 text-center">Performa</th>
              <th className="py-3.5 px-4 text-right">Aksi & Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 text-sm">
                  Tidak ada data driver yang sesuai dengan kriteria filter.
                </td>
              </tr>
            ) : (
              drivers.map((driver) => {
                const isReady = driver.status === 'Ready';
                const isWaiting = driver.status === 'Menunggu Assignment';
                const canAssign = isReady || isWaiting;

                return (
                  <tr 
                    key={driver.id} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Kolom 1: Driver Detail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={driver.avatarUrl}
                            alt={driver.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                          />
                          <span 
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                              driver.status === 'Ready' ? 'bg-emerald-500' :
                              driver.status === 'Trip' ? 'bg-blue-500' :
                              driver.status === 'Menunggu Assignment' ? 'bg-amber-500' :
                              driver.status === 'Izin' ? 'bg-rose-500' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            <span>{driver.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">({driver.id})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                              {driver.plateNumber}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{driver.branch}</span>
                          </div>
                          {driver.notes && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">
                              "{driver.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Status Driver */}
                    <td className="py-3 px-3">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === driver.id ? null : driver.id)}
                          className="flex items-center gap-1 group/btn hover:opacity-90"
                          title="Klik untuk ubah status driver"
                        >
                          {getStatusBadge(driver.status)}
                          <ChevronDown className="w-3 h-3 text-slate-500 group-hover/btn:text-slate-300 transition-colors" />
                        </button>

                        {/* Dropdown Ganti Status Langsung */}
                        {activeDropdownId === driver.id && (
                          <div className="absolute left-0 top-full mt-1.5 z-20 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 text-xs">
                            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                              Ubah Status Driver
                            </div>
                            {(['Ready', 'Trip', 'Menunggu Assignment', 'Izin', 'Off'] as DriverStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => {
                                  onChangeDriverStatus(driver.id, st);
                                  setActiveDropdownId(null);
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-slate-700/80 transition-colors flex items-center justify-between ${
                                  driver.status === st ? 'text-blue-400 font-semibold bg-slate-700/40' : 'text-slate-200'
                                }`}
                              >
                                <span>{st}</span>
                                {driver.status === st && <span className="text-blue-400">✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kolom 3: Jam Kerja */}
                    <td className="py-3 px-3 text-slate-300 font-mono">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{driver.startTime} - {driver.endTime}</span>
                      </div>
                    </td>

                    {/* Kolom 4: Total Tugas */}
                    <td className="py-3 px-3 text-center font-bold text-white font-mono text-sm">
                      {driver.totalTasks}
                    </td>

                    {/* Kolom 5: Selesai */}
                    <td className="py-3 px-3 text-center font-bold text-emerald-400 font-mono">
                      {driver.completedTasks}
                    </td>

                    {/* Kolom 6: Berjalan */}
                    <td className="py-3 px-3 text-center font-bold text-blue-400 font-mono">
                      {driver.inProgressTasks}
                    </td>

                    {/* Kolom 7: Pending */}
                    <td className="py-3 px-3 text-center font-bold text-amber-400 font-mono">
                      {driver.pendingTasks}
                    </td>

                    {/* Kolom 8: Cancel */}
                    <td className="py-3 px-3 text-center font-bold text-rose-400 font-mono">
                      {driver.cancelledTasks}
                    </td>

                    {/* Kolom 9: Skor Performa & Rating */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1 font-bold text-amber-400 font-mono text-xs">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{driver.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {driver.onTimeRate}% On-Time
                        </span>
                      </div>
                    </td>

                    {/* Kolom 10: Aksi (Riwayat, Penugasan, Edit & Hapus Driver) */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Tombol Assign Order Cepat */}
                        {canAssign && (
                          <button
                            onClick={() => onQuickAssign(driver)}
                            title="Tugaskan Order ke Driver ini"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition-all"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Tugaskan</span>
                          </button>
                        )}

                        {/* Tombol Riwayat Tugas */}
                        <button
                          onClick={() => onSelectDriverForHistory(driver)}
                          title="Lihat Riwayat Tugas Driver"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-all"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Edit Driver */}
                        <button
                          onClick={() => onEditDriver(driver)}
                          title="Edit Data Profil Driver"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 rounded-lg transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Hapus Driver */}
                        <button
                          onClick={() => onDeleteDriver(driver)}
                          title="Hapus Driver dari Database"
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Notes */}
      <div className="p-3 bg-slate-800/30 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
          <span>Tips: Klik label status untuk ganti status dinas, atau klik tombol Pensil untuk edit profil driver lengkap.</span>
        </div>
        <div className="text-slate-400 font-mono">
          PostgreSQL Database Sync Active
        </div>
      </div>

    </div>
  );
};
