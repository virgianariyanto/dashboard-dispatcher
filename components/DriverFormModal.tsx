'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Truck, Phone, MapPin, Clock, FileText } from 'lucide-react';
import { Driver, DriverStatus } from '@/types/dispatcher';
import { BRANCH_LIST } from '@/data/initialData';

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverToEdit: Driver | null;
  onSaveDriver: (driverData: Partial<Driver>) => void;
}

export const DriverFormModal: React.FC<DriverFormModalProps> = ({
  isOpen,
  onClose,
  driverToEdit,
  onSaveDriver,
}) => {
  const isEditMode = !!driverToEdit;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Motor (Honda Vario 160)');
  const [plateNumber, setPlateNumber] = useState('');
  const [branch, setBranch] = useState('Jakarta Pusat');
  const [status, setStatus] = useState<DriverStatus>('Ready');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');

  // Dynamic master data lists
  const [masterStatuses, setMasterStatuses] = useState<{ code: string; name: string }[]>([]);
  const [masterVehicles, setMasterVehicles] = useState<{ code: string; name: string }[]>([]);
  const [masterBranches, setMasterBranches] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch dynamic options from Master Data APIs
    const loadMasterData = async () => {
      try {
        const [stRes, vhRes, brRes] = await Promise.all([
          fetch('/api/master/status'),
          fetch('/api/master/vehicles'),
          fetch('/api/master/branches'),
        ]);

        if (stRes.ok) {
          const json = await stRes.json();
          if (json.success && json.data.length > 0) {
            setMasterStatuses(json.data);
          }
        }
        if (vhRes.ok) {
          const json = await vhRes.json();
          if (json.success && json.data.length > 0) {
            setMasterVehicles(json.data);
          }
        }
        if (brRes.ok) {
          const json = await brRes.json();
          if (json.success && json.data.length > 0) {
            setMasterBranches(json.data);
          }
        }
      } catch (err) {
        console.warn('Fallback to standard master options:', err);
      }
    };

    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (driverToEdit) {
      setName(driverToEdit.name);
      setPhone(driverToEdit.phone || '');
      setVehicleType(driverToEdit.vehicleType);
      setPlateNumber(driverToEdit.plateNumber);
      setBranch(driverToEdit.branch);
      setStatus(driverToEdit.status);
      setStartTime(driverToEdit.startTime || '08:00');
      setEndTime(driverToEdit.endTime || '17:00');
      setNotes(driverToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setVehicleType('Motor (Honda Vario 160)');
      setPlateNumber('');
      setBranch('Jakarta Pusat');
      setStatus('Ready');
      setStartTime('08:00');
      setEndTime('17:00');
      setNotes('');
    }
  }, [driverToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plateNumber) {
      alert('Nama driver dan Plat nomor wajib diisi.');
      return;
    }

    const payload: Partial<Driver> = {
      ...(isEditMode && driverToEdit ? { id: driverToEdit.id } : {}),
      name,
      phone: phone || '-',
      vehicleType,
      plateNumber: plateNumber.toUpperCase(),
      branch,
      status,
      startTime,
      endTime,
      notes,
    };

    onSaveDriver(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              {isEditMode ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditMode ? `Edit Data: ${driverToEdit.name}` : 'Tambah Driver Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditMode
                  ? 'Perbarui data identitas, armada, dan penempatan driver'
                  : 'Daftarkan personil driver baru yang terhubung ke data master'}
              </p>
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
          
          {/* Nama & Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Nama Lengkap Driver *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Jenis Kendaraan & Nomor Plat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-500" />
                  Jenis Kendaraan
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">Master Kendaraan</span>
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {masterVehicles.length > 0 ? (
                  masterVehicles.map((v) => (
                    <option key={v.code} value={v.name}>{v.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Motor (Honda Vario 160)">Motor (Honda Vario 160)</option>
                    <option value="Motor (Yamaha NMAX)">Motor (Yamaha NMAX)</option>
                    <option value="Mobil Box (Gran Max Blind Van)">Mobil Box (Gran Max Blind Van)</option>
                    <option value="Mobil Box (Isuzu Traga)">Mobil Box (Isuzu Traga)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Nomor Plat Polisi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: B 1234 KLA"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 uppercase font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Cabang & Status Awal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  Cabang Operasi
                </span>
                <span className="text-[10px] text-purple-600 font-mono">Master Cabang</span>
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {masterBranches.length > 0 ? (
                  masterBranches.map((b) => (
                    <option key={b.code} value={b.name}>{b.name}</option>
                  ))
                ) : (
                  BRANCH_LIST.filter((b) => b !== 'Semua Cabang').map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Status Ketersediaan</span>
                <span className="text-[10px] text-amber-600 font-mono">Master Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DriverStatus)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {masterStatuses.length > 0 ? (
                  masterStatuses.map((s) => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Ready">Standby / Ready</option>
                    <option value="Trip">Sedang Bertugas (Trip)</option>
                    <option value="Menunggu Assignment">Menunggu Assignment</option>
                    <option value="Izin">Izin / Tidak Masuk</option>
                    <option value="Off">Off / Libur</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Jam Kerja Mulai - Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                Jam Mulai Dinas
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-600" />
                Jam Selesai Dinas
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Catatan / Keterangan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-500" />
              Catatan / Wilayah Tugas Khusus
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Standby di Hub Dago, siap antar paket rute luar kota..."
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
              {isEditMode ? 'Simpan Perubahan' : 'Daftarkan Driver'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
