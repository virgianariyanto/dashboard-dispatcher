'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, MapPin, ClipboardCheck, Calendar, Building2 } from 'lucide-react';
import { Driver, Order, OrderStatus } from '@/types/dispatcher';

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
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [taskType, setTaskType] = useState('Replace');
  const [priority, setPriority] = useState<'Normal' | 'Tinggi' | 'Urgent'>('Normal');
  const [assignedDriverId, setAssignedDriverId] = useState('');
  const [notes, setNotes] = useState('');

  // Master options from PostgreSQL
  const [taskList, setTaskList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string>('');
  const [branchList, setBranchList] = useState<{ id: string; name: string; code: string; city: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Filter available drivers (Ready or Menunggu Assignment)
  const availableDrivers = drivers.filter(
    (d) => d.status === 'Ready' || d.status === 'Menunggu Assignment'
  );

  useEffect(() => {
    if (!isOpen) return;

    const loadMasters = async () => {
      try {
        const [taskRes, branchRes] = await Promise.all([
          fetch('/api/master/task-types'),
          fetch('/api/master/branches'),
        ]);

        if (taskRes.ok) {
          const tJson = await taskRes.json();
          if (tJson.success && Array.isArray(tJson.data)) {
            setTaskList(tJson.data);
            if (!selectedTaskTypeId && tJson.data.length > 0) {
              setTaskType(tJson.data[0].name);
              setSelectedTaskTypeId(tJson.data[0].id);
            }
          }
        }

        if (branchRes.ok) {
          const bJson = await branchRes.json();
          if (bJson.success && Array.isArray(bJson.data)) {
            setBranchList(bJson.data);
          }
        }
      } catch (err) {
        console.error('Failed loading master options:', err);
      }
    };

    loadMasters();
  }, [isOpen, selectedTaskTypeId]);

  useEffect(() => {
    if (preSelectedDriver) {
      setAssignedDriverId(preSelectedDriver.id);
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

    const selectedBranch = branchList.find((b) => b.id === selectedBranchId);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNumber: orderNum,
      customer,
      pickupLocation,
      dropoffLocation,
      status: assignedDriver ? ('Diterima' as OrderStatus) : ('Belum Ditugaskan' as OrderStatus),
      assignedDriverId: assignedDriver?.id,
      assignedDriverName: assignedDriver?.name,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || undefined,
      targetDeliveryTime: 'Dalam 2 Jam',
      taskType,
      priority,
      notes,
      taskTypeId: selectedTaskTypeId || undefined,
      branchId: selectedBranchId || undefined,
      branchName: selectedBranch?.name || undefined,
    };

    onSaveOrder(newOrder);
    onClose();

    // Reset form
    setCustomer('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setPickupLocation('');
    setDropoffLocation('');
    setNotes('');
    setAssignedDriverId('');
    setSelectedBranchId('');
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
              placeholder="Contoh: PT Surya Logistik"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Tanggal Mulai Order & Tanggal Selesai Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Tanggal Mulai Order *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Tanggal Selesai Order
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
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

          {/* Jenis Tugas & Pilihan Cabang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                  Jenis Tugas
                </span>
                <span className="text-[10px] text-blue-600 font-mono">Master Tugas</span>
              </label>
              <select
                value={taskType}
                onChange={(e) => {
                  const tName = e.target.value;
                  setTaskType(tName);
                  const found = taskList.find((t) => t.name === tName);
                  if (found) setSelectedTaskTypeId(found.id);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {taskList.length > 0
                  ? taskList.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))
                  : (
                      <>
                        <option value="Replace">Replace</option>
                        <option value="Short Term">Short Term</option>
                        <option value="Antar Short Term">Antar Short Term</option>
                        <option value="Tarik Short Term">Tarik Short Term</option>
                      </>
                    )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  Cabang
                </span>
                <span className="text-[10px] text-indigo-600 font-mono">Master Cabang</span>
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              >
                <option value="">-- Pilih Cabang (Opsional) --</option>
                {branchList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name} ({b.city})
                  </option>
                ))}
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
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
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
                    {d.name} ({d.status} • {d.simType})
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
              placeholder="Instruksi khusus penugasan armada atau kontak customer..."
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
            >
              Simpan & Terbitkan Order
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
