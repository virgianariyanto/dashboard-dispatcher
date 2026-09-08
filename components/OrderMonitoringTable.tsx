'use client';

import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  Clock, 
  Calendar,
  Building2,
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Hourglass, 
  PlusCircle, 
  ClipboardCheck, 
  UserPlus, 
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Order, Driver, OrderStatus } from '@/types/dispatcher';

interface OrderMonitoringTableProps {
  orders: Order[];
  drivers: Driver[];
  onOpenNewOrder: () => void;
  onAssignOrder: (order: Order) => void;
  onCompleteOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  isLoading?: boolean;
}

export const OrderMonitoringTable: React.FC<OrderMonitoringTableProps> = ({
  orders,
  onOpenNewOrder,
  onAssignOrder,
  onCompleteOrder,
  onCancelOrder,
  onDeleteOrder,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 when filter/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      const matchStatus = statusFilter === 'Semua' || order.status === statusFilter;

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        (order.orderDate && order.orderDate.toLowerCase().includes(q)) ||
        order.pickupLocation.toLowerCase().includes(q) ||
        order.dropoffLocation.toLowerCase().includes(q) ||
        (order.branchName && order.branchName.toLowerCase().includes(q)) ||
        (order.assignedDriverName && order.assignedDriverName.toLowerCase().includes(q)) ||
        (order.taskType && order.taskType.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

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

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const unassigned = orders.filter((o) => o.status === 'Belum Ditugaskan' || !o.assignedDriverId).length;
    const inProgress = orders.filter((o) => o.status === 'Berjalan' || o.status === 'Diterima').length;
    const completed = orders.filter((o) => o.status === 'Selesai').length;
    const cancelled = orders.filter((o) => o.status === 'Dibatalkan').length;
    return { total, unassigned, inProgress, completed, cancelled };
  }, [orders]);

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'Belum Ditugaskan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Hourglass className="w-3 h-3 text-amber-600" />
            <span>Belum Ditugaskan</span>
          </span>
        );
      case 'Diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Driver Ditugaskan</span>
          </span>
        );
      case 'Berjalan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <PlayCircle className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>Dalam Pengantaran</span>
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Selesai Terkirim</span>
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">
            Urgent
          </span>
        );
      case 'Tinggi':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            Tinggi
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Monitoring Order & Penugasan Armada
            </h2>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 font-semibold">
              {filteredOrders.length} Order Ditampilkan
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola alur penugasan dari order masuk, pengiriman di jalan, hingga verifikasi selesai terkirim.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Input Order Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500">Total Semua Order</div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{stats.total}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-amber-700 font-medium flex items-center justify-between">
            <span>Belum Ditugaskan</span>
            {stats.unassigned > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono mt-0.5">{stats.unassigned}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-blue-700 font-medium">Dalam Pengantaran</div>
          <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">{stats.inProgress}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-700 font-medium">Selesai Terkirim</div>
          <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">{stats.completed}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] text-rose-700 font-medium">Dibatalkan</div>
          <div className="text-xl font-bold text-rose-600 font-mono mt-0.5">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Order, customer, rute, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Status Pills & Tambah Order Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {['Semua', 'Belum Ditugaskan', 'Berjalan', 'Selesai', 'Dibatalkan'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 text-[11px] cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Order</span>
          </button> */}
        </div>
      </div>

      {/* Table Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">No. Order & Prioritas</th>
                <th className="px-4 py-3.5">Customer & Waktu</th>
                <th className="px-4 py-3.5">Rute (Pickup &rarr; Dropoff)</th>
                <th className="px-4 py-3.5">Jenis Tugas</th>
                <th className="px-4 py-3.5">Driver Bertugas</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi Dispatcher</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [...Array(6)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-24 bg-slate-200 rounded font-mono" />
                        <div className="h-4 w-14 bg-slate-100 rounded-full" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-6 w-20 bg-slate-200 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <div className="h-3 w-40 bg-slate-200 rounded" />
                        <div className="h-3 w-36 bg-slate-100 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-6 w-24 bg-slate-200 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="h-7 w-20 bg-slate-200 rounded-lg mx-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada order yang sesuai filter atau pencarian.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const isUnassigned = ord.status === 'Belum Ditugaskan' || !ord.assignedDriverId;
                  const isWalking = ord.status === 'Berjalan' || ord.status === 'Diterima';
                  const isCompleted = ord.status === 'Selesai';
                  const isCancelled = ord.status === 'Dibatalkan';

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Kolom 1: No Order & Prioritas */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {ord.orderNumber}
                          </span>
                          {getPriorityBadge(ord.priority)}
                        </div>
                        {ord.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5 italic">
                            "{ord.notes}"
                          </div>
                        )}
                      </td>

                      {/* Kolom 2: Customer & Waktu */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{ord.customer}</span>
                          {ord.branchName && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Cabang Hub Armada">
                              <Building2 className="w-3 h-3 text-indigo-500" />
                              {ord.branchName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5 flex-wrap">
                          {ord.orderDate && (
                            <>
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-medium" title="Tanggal Order">
                                <Calendar className="w-3 h-3 text-blue-600" />
                                <span>{ord.orderDate}</span>
                              </span>
                              <span className="text-slate-300">•</span>
                            </>
                          )}
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Jam: {ord.createdAt}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-blue-600 font-medium">Target: {ord.targetDeliveryTime}</span>
                        </div>
                      </td>

                      {/* Kolom 3: Rute Pickup -> Dropoff */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="truncate">{ord.pickupLocation}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-500 text-[11px] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="truncate">{ord.dropoffLocation}</span>
                        </div>
                      </td>

                      {/* Kolom 4: Jenis Tugas */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                          <ClipboardCheck className="w-3 h-3 text-blue-600" />
                          <span className="truncate max-w-[140px]">{ord.taskType}</span>
                        </div>
                      </td>

                      {/* Kolom 5: Driver Bertugas */}
                      <td className="px-4 py-3.5">
                        {ord.assignedDriverId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-700">
                              {ord.assignedDriverName?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">
                                {ord.assignedDriverName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {ord.assignedDriverId}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-semibold italic flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Belum Ada Driver
                          </span>
                        )}
                      </td>

                      {/* Kolom 7: Status */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(ord.status)}
                      </td>

                      {/* Kolom 8: Aksi */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          
                          {/* Aksi 1: Tugaskan Driver jika Unassigned */}
                          {isUnassigned && (
                            <button
                              onClick={() => onAssignOrder(ord)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] transition-all shadow-xs cursor-pointer"
                              title="Tugaskan ke Driver Ready"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Tugaskan</span>
                            </button>
                          )}

                          {/* Aksi 2: Selesaikan Order jika sedang Berjalan */}
                          {isWalking && (
                            <button
                              onClick={() => onCompleteOrder(ord.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-all shadow-xs cursor-pointer"
                              title="Tandai pesanan telah selesai dikirim"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Selesaikan</span>
                            </button>
                          )}

                          {/* Aksi 3: Batalkan Order jika belum selesai */}
                          {!isCompleted && !isCancelled && (
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin membatalkan order ${ord.orderNumber}?`)) {
                                  onCancelOrder(ord.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                              title="Batalkan Order"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Aksi 4: Hapus Order jika Batal atau Selesai */}
                          {(isCancelled || isCompleted) && onDeleteOrder && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus permanen data order ${ord.orderNumber}?`)) {
                                  onDeleteOrder(ord.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                              title="Hapus Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

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
                '0 order'
              ) : (
                <>
                  Menampilkan <strong className="font-semibold text-slate-800">{startIndex + 1}</strong> - <strong className="font-semibold text-slate-800">{endIndex}</strong> dari <strong className="font-semibold text-slate-800">{totalItems}</strong> order
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
      </div>

    </div>
  );
};
