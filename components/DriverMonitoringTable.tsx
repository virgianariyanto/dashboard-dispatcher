'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  History, 
  PlusCircle, 
  Star, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Edit,
  Trash2,
  User,
  Building2,
  MessageSquare
} from 'lucide-react';
import { Driver, DriverStatus } from '@/types/dispatcher';
import { openWhatsAppChat } from '@/lib/whatsapp';

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
  isLoading?: boolean;
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
  isLoading = false,
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 when filter/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Pagination calculation
  const totalItems = drivers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedDrivers = drivers.slice(startIndex, endIndex);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Standby / Ready
          </span>
        );
      case 'Trip':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Sedang Bertugas
          </span>
        );
      case 'Menunggu Assignment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Menunggu Assignment
          </span>
        );
      case 'Izin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Izin / Tidak Masuk
          </span>
        );
      case 'Off':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Off / Libur
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Tabel Monitoring Driver & Tugas
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono font-medium border border-slate-200">
              {drivers.length} Driver Ditampilkan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status ketersediaan, jam kerja, pembagian tugas harian, serta kelola data armada driver.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama driver / NIK..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Pill */}
          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={selectedStatus}
              onChange={(e) => onSelectStatus(e.target.value)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer font-medium"
              aria-label="Filter Status"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-700">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Tambah Driver Baru */}
          <button
            onClick={onOpenAddDriver}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Driver</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-4">Driver</th>
              <th className="py-3.5 px-3">NIK</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-3">Jam Kerja</th>
              <th className="py-3.5 px-3 text-center">Tugas</th>
              <th className="py-3.5 px-3 text-center text-emerald-700">Selesai</th>
              <th className="py-3.5 px-3 text-center text-blue-700">Berjalan</th>
              <th className="py-3.5 px-3 text-center text-amber-700">Pending</th>
              <th className="py-3.5 px-3 text-center text-rose-700">Cancel</th>
              <th className="py-3.5 px-3 text-center">Performa</th>
              <th className="py-3.5 px-4 text-right">Aksi & Manajemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {isLoading ? (
              [...Array(6)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-slate-200 rounded" />
                        <div className="h-2.5 w-16 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-6 w-20 bg-slate-200 rounded-full" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-7 w-20 bg-slate-200 rounded-lg mx-auto" />
                  </td>
                </tr>
              ))
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500 text-sm">
                  Tidak ada data driver yang sesuai dengan kriteria filter.
                </td>
              </tr>
            ) : (
              paginatedDrivers.map((driver) => {
                const isReady = driver.status === 'Ready';
                const isWaiting = driver.status === 'Menunggu Assignment';
                const canAssign = isReady || isWaiting;

                return (
                  <tr 
                    key={driver.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Kolom 1: Driver Detail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shadow-xs shrink-0">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <span 
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                              driver.status === 'Ready' ? 'bg-emerald-500' :
                              driver.status === 'Trip' ? 'bg-blue-500' :
                              driver.status === 'Menunggu Assignment' ? 'bg-amber-500' :
                              driver.status === 'Izin' ? 'bg-rose-500' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            <span>{driver.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {driver.simType}
                            </span>
                            {driver.branchName && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Cabang Hub Armada">
                                <Building2 className="w-3 h-3 text-indigo-500" />
                                {driver.branchName}
                              </span>
                            )}
                          </div>
                          {driver.notes && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-0.5">
                              "{driver.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: NIK */}
                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {driver.nik ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800 border border-slate-200">
                          {driver.nik}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Kolom 3: Status Driver */}
                    <td className="py-3 px-3">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === driver.id ? null : driver.id)}
                          className="flex items-center gap-1 group/btn hover:opacity-90 cursor-pointer"
                          title="Klik untuk ubah status driver"
                        >
                          {getStatusBadge(driver.status)}
                          <ChevronDown className="w-3 h-3 text-slate-400 group-hover/btn:text-slate-600 transition-colors" />
                        </button>

                        {/* Dropdown Ganti Status Langsung */}
                        {activeDropdownId === driver.id && (
                          <div className="absolute left-0 top-full mt-1.5 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                              Ubah Status Driver
                            </div>
                            {(['Ready', 'Trip', 'Menunggu Assignment', 'Izin', 'Off'] as DriverStatus[]).map((st) => (
                              <button
                                key={st}
                                onClick={() => {
                                  onChangeDriverStatus(driver.id, st);
                                  setActiveDropdownId(null);
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                                  driver.status === st ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                                }`}
                              >
                                <span>{st}</span>
                                {driver.status === st && <span className="text-blue-600">✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Kolom 3: Jam Kerja */}
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{driver.startTime} - {driver.endTime}</span>
                      </div>
                    </td>

                    {/* Kolom 4: Total Tugas */}
                    <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono text-sm">
                      {driver.totalTasks}
                    </td>

                    {/* Kolom 5: Selesai */}
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 font-mono">
                      {driver.completedTasks}
                    </td>

                    {/* Kolom 6: Berjalan */}
                    <td className="py-3 px-3 text-center font-bold text-blue-600 font-mono">
                      {driver.inProgressTasks}
                    </td>

                    {/* Kolom 7: Pending */}
                    <td className="py-3 px-3 text-center font-bold text-amber-600 font-mono">
                      {driver.pendingTasks}
                    </td>

                    {/* Kolom 8: Cancel */}
                    <td className="py-3 px-3 text-center font-bold text-rose-600 font-mono">
                      {driver.cancelledTasks}
                    </td>

                    {/* Kolom 9: Skor Performa & Rating */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1 font-bold text-amber-600 font-mono text-xs">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{driver.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Tugaskan</span>
                          </button>
                        )}

                        {/* Tombol Riwayat Tugas */}
                        <button
                          onClick={() => onSelectDriverForHistory(driver)}
                          title="Lihat Riwayat Tugas Driver"
                          className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Chat WhatsApp Driver */}
                        {driver.phone && (
                          <button
                            onClick={() => openWhatsAppChat(driver.phone)}
                            title={`Chat WhatsApp langsung ke ${driver.name} (${driver.phone})`}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}

                        {/* Tombol Edit Driver */}
                        <button
                          onClick={() => onEditDriver(driver)}
                          title="Edit Data Profil Driver"
                          className="p-1.5 bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Hapus Driver */}
                        <button
                          onClick={() => onDeleteDriver(driver)}
                          title="Hapus Driver dari Database"
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer shadow-2xs"
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

      {/* Pagination Controls */}
      <div className="p-3 sm:px-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            {totalItems === 0 ? (
              '0 driver'
            ) : (
              <>
                Menampilkan <strong className="font-semibold text-slate-800">{startIndex + 1}</strong> - <strong className="font-semibold text-slate-800">{endIndex}</strong> dari <strong className="font-semibold text-slate-800">{totalItems}</strong> driver
              </>
            )}
          </span>
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-slate-400 text-[11px]">Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Navigation Buttons */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {getPaginationRange(safeCurrentPage, totalPages).map((item, idx) => {
              if (item === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 text-xs">
                    ...
                  </span>
                );
              }
              const pageNum = item as number;
              const isActive = pageNum === safeCurrentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Table Footer Notes */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
          <span>Tips: Klik label status untuk ganti status dinas, atau klik tombol Pensil untuk edit profil driver lengkap.</span>
        </div>
        <div className="text-slate-400 font-medium text-[11px]">
          Live Data Sync Active
        </div>
      </div>

    </div>
  );
};
