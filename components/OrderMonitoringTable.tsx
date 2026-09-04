'use client';

import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Hourglass, 
  PlusCircle, 
  Package, 
  Building2, 
  UserPlus, 
  AlertTriangle,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Order, Driver, OrderStatus } from '@/types/dispatcher';
import { BRANCH_LIST } from '@/data/initialData';

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
  drivers,
  selectedBranch,
  onSelectBranch,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Belum Ditugaskan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Hourglass className="w-3 h-3 text-amber-400" />
            <span>Belum Ditugaskan</span>
          </span>
        );
      case 'Diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            <span>Diterima Driver</span>
          </span>
        );
      case 'Berjalan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <PlayCircle className="w-3 h-3 text-blue-400 animate-pulse" />
            <span>Dalam Pengantaran</span>
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Selesai Terkirim</span>
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
            Urgent
          </span>
        );
      case 'Tinggi':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
            Tinggi
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Monitoring Order & Penugasan Armada
            </h2>
            <span className="text-[10px] font-mono bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
              {filteredOrders.length} Order Ditampilkan
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Kelola alur penugasan dari order masuk, pengiriman di jalan, hingga verifikasi selesai terkirim (PostgreSQL 18).
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Input Order Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400">Total Semua Order</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">{stats.total}</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-amber-400 font-medium flex items-center justify-between">
            <span>Belum Ditugaskan</span>
            {stats.unassigned > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono mt-0.5">{stats.unassigned}</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-blue-400 font-medium">Dalam Pengantaran</div>
          <div className="text-xl font-bold text-blue-300 font-mono mt-0.5">{stats.inProgress}</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-emerald-400 font-medium">Selesai Terkirim</div>
          <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">{stats.completed}</div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-rose-400 font-medium">Dibatalkan</div>
          <div className="text-xl font-bold text-rose-300 font-mono mt-0.5">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No. Order, customer, rute, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
          {['Semua', 'Belum Ditugaskan', 'Berjalan', 'Selesai', 'Dibatalkan'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 text-[11px] ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Orders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
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

            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
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
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Kolom 1: No Order & Prioritas */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white text-xs">
                            {ord.orderNumber}
                          </span>
                          {getPriorityBadge(ord.priority)}
                        </div>
                        {ord.notes && (
                          <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5 italic">
                            "{ord.notes}"
                          </div>
                        )}
                      </td>

                      {/* Kolom 2: Customer & Waktu */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-100">{ord.customer}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Masuk: {ord.createdAt}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-blue-400">Target: {ord.targetDeliveryTime}</span>
                        </div>
                      </td>

                      {/* Kolom 3: Rute Pickup -> Dropoff */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="truncate">{ord.pickupLocation}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-400 text-[11px] mt-1">
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                          <span className="truncate">{ord.dropoffLocation}</span>
                        </div>
                      </td>

                      {/* Kolom 4: Jenis Muatan */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-slate-200">
                          <Package className="w-3 h-3 text-orange-400" />
                          <span className="truncate max-w-[140px]">{ord.packageType}</span>
                        </div>
                      </td>

                      {/* Kolom 5: Cabang */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                          <Building2 className="w-3 h-3 text-purple-400" />
                          <span>{ord.branch}</span>
                        </div>
                      </td>

                      {/* Kolom 6: Driver Bertugas */}
                      <td className="px-4 py-3.5">
                        {ord.assignedDriverId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold text-blue-300">
                              {ord.assignedDriverName?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-xs">
                                {ord.assignedDriverName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {ord.assignedDriverId}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-semibold italic flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
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
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-all shadow-sm"
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
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-all shadow-sm"
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
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
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
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
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
