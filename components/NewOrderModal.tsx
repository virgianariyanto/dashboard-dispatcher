'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Truck, MapPin, Building, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { Driver, Order, OrderStatus } from '@/types/dispatcher';
import { BRANCH_LIST } from '@/data/initialData';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  preSelectedDriver?: Driver | null;
  onSaveOrder: (newOrder: Order) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  drivers,
  preSelectedDriver,
  onSaveOrder,
}) => {
  const [customer, setCustomer] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [branch, setBranch] = useState('Jakarta Pusat');
  const [packageType, setPackageType] = useState('Paket Reguler');
  const [priority, setPriority] = useState<'Normal' | 'Tinggi' | 'Urgent'>('Normal');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [notes, setNotes] = useState('');

  // Filter available drivers (Ready or Menunggu Assignment)
  const availableDrivers = drivers.filter(
    (d) => d.status === 'Ready' || d.status === 'Menunggu Assignment'
  );

  useEffect(() => {
    if (preSelectedDriver) {
      setAssignedDriverId(preSelectedDriver.id);
      setBranch(preSelectedDriver.branch);
    } else {
      setAssignedDriverId('');
    }
  }, [preSelectedDriver, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !pickupLocation || !dropoffLocation) {
      alert('Mohon lengkapi Nama Customer, Lokasi Pickup, dan Lokasi Dropoff.');
      return;
    }

    const assignedDriver = drivers.find((d) => d.id === assignedDriverId);
    const orderNum = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNumber: orderNum,
      customer,
      pickupLocation,
      dropoffLocation,
      branch,
      status: assignedDriver ? ('Diterima' as OrderStatus) : ('Belum Ditugaskan' as OrderStatus),
      assignedDriverId: assignedDriver?.id,
      assignedDriverName: assignedDriver?.name,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      targetDeliveryTime: 'Dalam 2 Jam',
      packageType,
      priority,
      notes,
    };

    onSaveOrder(newOrder);
    onClose();

    // Reset form
    setCustomer('');
    setPickupLocation('');
    setDropoffLocation('');
    setNotes('');
    setAssignedDriverId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Input Order & Penugasan Driver</h3>
              <p className="text-xs text-slate-400">Buat pesanan baru dan tugaskan langsung ke driver armada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs text-slate-200">
          
          {/* Customer / Pengirim */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Customer / Merchant Pengirim *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PT Surya Logistik / Toko Makmur"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Lokasi Pickup & Dropoff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Lokasi Jemput (Pickup) *
              </label>
              <input
                type="text"
                required
                placeholder="Alamat penjemputan barang"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                Lokasi Tujuan (Dropoff) *
              </label>
              <input
                type="text"
                required
                placeholder="Alamat penerima paket"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Cabang & Jenis Paket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Cabang Operasional
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {BRANCH_LIST.filter((b) => b !== 'Semua Cabang').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Jenis Muatan / Paket
              </label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Paket Reguler (Kardus)">Paket Reguler (Kardus)</option>
                <option value="Dokumen Penting">Dokumen Penting</option>
                <option value="Makanan & Minuman (Thermal Box)">Makanan & Minuman (Thermal Box)</option>
                <option value="Barang Elektronik">Barang Elektronik</option>
                <option value="Farmasi / Medis">Farmasi / Medis</option>
              </select>
            </div>
          </div>

          {/* Prioritas & Driver Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Tingkat Prioritas
              </label>
              <div className="flex gap-2">
                {(['Normal', 'Tinggi', 'Urgent'] as const).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      priority === p
                        ? p === 'Urgent' 
                          ? 'bg-rose-500/30 text-rose-300 border-rose-500' 
                          : p === 'Tinggi'
                          ? 'bg-amber-500/30 text-amber-300 border-amber-500'
                          : 'bg-blue-500/30 text-blue-300 border-blue-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Tugaskan Driver (Assignment)</span>
                <span className="text-[10px] text-emerald-400">
                  {availableDrivers.length} Siap
                </span>
              </label>
              <select
                value={assignedDriverId}
                onChange={(e) => setAssignedDriverId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Simpan sebagai Belum Ditugaskan --</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status} • {d.vehicleType.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Catatan / Instruksi Dispatcher
            </label>
            <textarea
              rows={2}
              placeholder="Instruksi khusus penanganan muatan atau kontak penerima..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              Simpan & Terbitkan Order
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
