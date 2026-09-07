'use client';

import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Hourglass, 
  PlusCircle, 
  Package, 
  Building2, 
  UserPlus, 
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { Order, Driver, OrderStatus } from '@/types/dispatcher';

interface OrderMonitoringTableProps {
  orders: Order[];
  drivers: Driver[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  onOpenNewOrder: () => void;
  onAssignOrder: (order: Order) => void;
  onCompleteOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrderMonitoringTable: React.FC<OrderMonitoringTableProps> = ({
  orders,
  selectedBranch,
  onOpenNewOrder,
  onAssignOrder,
  onCompleteOrder,
  onCancelOrder,
  onDeleteOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Branch filter
      const matchBranch = selectedBranch === 'Semua Cabang' || order.branch === selectedBranch;

      // Status filter
      const matchStatus = statusFilter === 'Semua' || order.status === statusFilter;

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.pickupLocation.toLowerCase().includes(q) ||
        order.dropoffLocation.toLowerCase().includes(q) ||
        (order.assignedDriverName && order.assignedDriverName.toLowerCase().includes(q)) ||
        (order.packageType && order.packageType.toLowerCase().includes(q));

      return matchBranch && matchStatus && matchSearch;
    });
  }, [orders, selectedBranch, statusFilter, searchQuery]);

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
            Kelola alur penugasan dari order masuk, pengiriman di jalan, hingga verifikasi selesai terkirim (PostgreSQL 18).
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Input Order Baru</span>
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

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
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
                <th className="px-4 py-3.5">Jenis Muatan</th>
                <th className="px-4 py-3.5">Cabang Hub</th>
                <th className="px-4 py-3.5">Driver Bertugas</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi Dispatcher</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada order yang sesuai filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
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
                        <div className="font-semibold text-slate-900">{ord.customer}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Masuk: {ord.createdAt}</span>
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

                      {/* Kolom 4: Jenis Muatan */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                          <Package className="w-3 h-3 text-orange-500" />
                          <span className="truncate max-w-[140px]">{ord.packageType}</span>
                        </div>
                      </td>

                      {/* Kolom 5: Cabang */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>{ord.branch}</span>
                        </div>
                      </td>

                      {/* Kolom 6: Driver Bertugas */}
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
      </div>

    </div>
  );
};
