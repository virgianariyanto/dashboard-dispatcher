'use client';

import React from 'react';
import { X, AlertCircle, UserCheck, MapPin, Clock, Tag } from 'lucide-react';
import { Order, Driver } from '@/types/dispatcher';

interface UnassignedOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedOrders: Order[];
  availableDrivers: Driver[];
  onAssignOrderToDriver: (orderId: string, driverId: string) => void;
}

export const UnassignedOrdersModal: React.FC<UnassignedOrdersModalProps> = ({
  isOpen,
  onClose,
  unassignedOrders,
  availableDrivers,
  onAssignOrderToDriver,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Daftar Order Belum Ditugaskan (Unassigned)</span>
                <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {unassignedOrders.length} Order
                </span>
              </h3>
              <p className="text-xs text-slate-400">Segera tugaskan ke driver standby untuk mencegah keterlambatan SLA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {unassignedOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Semua order sudah memiliki driver. Tidak ada order unassigned saat ini.
            </div>
          ) : (
            unassignedOrders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400">{order.orderNumber}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-bold text-slate-200">{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Masuk: {order.createdAt}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.priority === 'Urgent' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Pickup: {order.pickupLocation}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>Dropoff: {order.dropoffLocation}</span>
                  </div>
                </div>

                {/* Assignment Dropdown & Button */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-400">
                    Muatan: <span className="text-slate-300 font-medium">{order.packageType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      id={`driver-select-${order.id}`}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Pilih Driver Standby --</option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.status} • {d.vehicleType.split(' ')[0]})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const selectEl = document.getElementById(`driver-select-${order.id}`) as HTMLSelectElement;
                        if (!selectEl || !selectEl.value) {
                          alert('Silakan pilih driver standby terlebih dahulu.');
                          return;
                        }
                        onAssignOrderToDriver(order.id, selectEl.value);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Tugaskan</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
