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
  const [packageType, setPackageType] = useState('Paket Reguler (Kardus/Box)');
  const [priority, setPriority] = useState<'Normal' | 'Tinggi' | 'Urgent'>('Normal');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [notes, setNotes] = useState('');

  // Master options from PostgreSQL
  const [branchList, setBranchList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [cargoList, setCargoList] = useState<{ id: string; name: string; code: string; category: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedCargoTypeId, setSelectedCargoTypeId] = useState<string>('');

  // Filter available drivers (Ready or Menunggu Assignment)
  const availableDrivers = drivers.filter(
    (d) => d.status === 'Ready' || d.status === 'Menunggu Assignment'
  );

  useEffect(() => {
    if (!isOpen) return;

    const loadMasters = async () => {
      try {
        const [branchesRes, cargoRes] = await Promise.all([
          fetch('/api/master/branches'),
          fetch('/api/master/cargo-types'),
        ]);

        if (branchesRes.ok) {
          const bJson = await branchesRes.json();
          if (bJson.success && Array.isArray(bJson.data)) {
            setBranchList(bJson.data);
            if (!selectedBranchId && bJson.data.length > 0) {
              const defaultBranch = preSelectedDriver 
                ? bJson.data.find((b: any) => b.name === preSelectedDriver.branch) || bJson.data[0]
                : bJson.data[0];
              setBranch(defaultBranch.name);
              setSelectedBranchId(defaultBranch.id);
            }
          }
        }

        if (cargoRes.ok) {
          const cJson = await cargoRes.json();
          if (cJson.success && Array.isArray(cJson.data)) {
            setCargoList(cJson.data);
            if (!selectedCargoTypeId && cJson.data.length > 0) {
              setPackageType(cJson.data[0].name);
              setSelectedCargoTypeId(cJson.data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed loading master options:', err);
      }
    };

    loadMasters();
  }, [isOpen, preSelectedDriver, selectedBranchId, selectedCargoTypeId]);

  useEffect(() => {
    if (preSelectedDriver) {
      setAssignedDriverId(preSelectedDriver.id);
      setBranch(preSelectedDriver.branch);
      if (branchList.length > 0) {
        const match = branchList.find((b) => b.name === preSelectedDriver.branch);
        if (match) setSelectedBranchId(match.id);
      }
    } else {
      setAssignedDriverId('');
    }
  }, [preSelectedDriver, isOpen, branchList]);

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
      branchId: selectedBranchId || undefined,
      cargoTypeId: selectedCargoTypeId || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Input Order & Penugasan Driver</h3>
              <p className="text-xs text-slate-500">Buat pesanan baru dan tugaskan langsung ke driver armada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          
          {/* Customer / Pengirim */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Customer / Merchant Pengirim *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PT Surya Logistik / Toko Makmur"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Lokasi Pickup & Dropoff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Lokasi Jemput (Pickup) *
              </label>
              <input
                type="text"
                required
                placeholder="Alamat penjemputan barang"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-600" />
                Lokasi Tujuan (Dropoff) *
              </label>
              <input
                type="text"
                required
                placeholder="Alamat penerima paket"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Cabang & Jenis Paket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Cabang Operasional</span>
                <span className="text-[9px] text-emerald-600 font-mono">Master Branch</span>
              </label>
              <select
                value={branch}
                onChange={(e) => {
                  const bName = e.target.value;
                  setBranch(bName);
                  const found = branchList.find((b) => b.name === bName);
                  if (found) setSelectedBranchId(found.id);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {branchList.length > 0
                  ? branchList.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.code})
                      </option>
                    ))
                  : BRANCH_LIST.filter((b) => b !== 'Semua Cabang').map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Jenis Muatan / Paket</span>
                <span className="text-[9px] text-orange-600 font-mono">Master Cargo</span>
              </label>
              <select
                value={packageType}
                onChange={(e) => {
                  const cName = e.target.value;
                  setPackageType(cName);
                  const found = cargoList.find((c) => c.name === cName);
                  if (found) setSelectedCargoTypeId(found.id);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {cargoList.length > 0
                  ? cargoList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} [{c.category}]
                      </option>
                    ))
                  : (
                    <>
                      <option value="Paket Reguler (Kardus/Box)">Paket Reguler (Kardus/Box)</option>
                      <option value="Dokumen & Surat Berharga">Dokumen & Surat Berharga</option>
                      <option value="Elektronik & Barang Pecah Belah">Elektronik & Barang Pecah Belah</option>
                      <option value="Makanan & Minuman Segar">Makanan & Minuman Segar</option>
                      <option value="Farmasi & Sampel Medis">Farmasi & Sampel Medis</option>
                    </>
                  )}
              </select>
            </div>
          </div>

          {/* Prioritas & Driver Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
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
                          ? 'bg-rose-50 text-rose-700 border-rose-300' 
                          : p === 'Tinggi'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Tugaskan Driver (Assignment)</span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {availableDrivers.length} Siap
                </span>
              </label>
              <select
                value={assignedDriverId}
                onChange={(e) => setAssignedDriverId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
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
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Catatan / Instruksi Dispatcher
            </label>
            <textarea
              rows={2}
              placeholder="Instruksi khusus penanganan muatan atau kontak penerima..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition-colors"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              Simpan & Terbitkan Order
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
