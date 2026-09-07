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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Daftar Order Belum Ditugaskan (Unassigned)</span>
                <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-mono font-semibold border border-rose-200">
                  {unassignedOrders.length} Order
                </span>
              </h3>
              <p className="text-xs text-slate-500">Segera tugaskan ke driver standby untuk mencegah keterlambatan SLA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600">{order.orderNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-900">{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Masuk: {order.createdAt}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.priority === 'Urgent' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pickup: {order.pickupLocation}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>Dropoff: {order.dropoffLocation}</span>
                  </div>
                </div>

                {/* Assignment Dropdown & Button */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-500">
                    Jenis Tugas: <span className="text-slate-800 font-medium">{order.taskType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      id={`driver-select-${order.id}`}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                    >
                      <option value="">-- Pilih Driver Standby --</option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.status} • {d.simType})
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
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
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
