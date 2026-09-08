'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Phone, Clock, FileText, CreditCard, Building2 } from 'lucide-react';
import { Driver, DriverStatus } from '@/types/dispatcher';

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
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [simType, setSimType] = useState('SIM A');
  const [status, setStatus] = useState<DriverStatus>('Ready');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [branchId, setBranchId] = useState('');

  // Dynamic master data lists
  const [masterStatuses, setMasterStatuses] = useState<{ code: string; name: string }[]>([]);
  const [masterSimTypes, setMasterSimTypes] = useState<{ code: string; name: string }[]>([]);
  const [masterBranches, setMasterBranches] = useState<{ id: string; code: string; name: string; city: string }[]>([]);

  useEffect(() => {
    // Fetch dynamic options from Master Data APIs
    const loadMasterData = async () => {
      try {
        const [stRes, simRes, brRes] = await Promise.all([
          fetch('/api/master/status'),
          fetch('/api/master/sim-types'),
          fetch('/api/master/branches'),
        ]);

        if (stRes.ok) {
          const json = await stRes.json();
          if (json.success && json.data.length > 0) {
            setMasterStatuses(json.data);
          }
        }
        if (simRes.ok) {
          const json = await simRes.json();
          if (json.success && json.data.length > 0) {
            setMasterSimTypes(json.data);
          }
        }
        if (brRes.ok) {
          const json = await brRes.json();
          if (json.success && Array.isArray(json.data)) {
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
      setNik(driverToEdit.nik || '');
      setPhone(driverToEdit.phone || '');
      setSimType(driverToEdit.simType || 'SIM A');
      setStatus(driverToEdit.status);
      setStartTime(driverToEdit.startTime || '08:00');
      setEndTime(driverToEdit.endTime || '17:00');
      setNotes(driverToEdit.notes || '');
      setBranchId(driverToEdit.branchId || '');
    } else {
      setName('');
      setNik('');
      setPhone('');
      setSimType('SIM A');
      setStatus('Ready');
      setStartTime('08:00');
      setEndTime('17:00');
      setNotes('');
      setBranchId('');
    }
  }, [driverToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama driver wajib diisi.');
      return;
    }

    const payload: Partial<Driver> = {
      ...(isEditMode && driverToEdit ? { id: driverToEdit.id } : {}),
      name: name.trim(),
      nik: nik.trim() || undefined,
      phone: phone || '-',
      simType,
      status,
      startTime,
      endTime,
      notes,
      branchId: branchId || undefined,
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
                  ? 'Perbarui data identitas dan kualifikasi lisensi driver'
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
          
          {/* Nama & NIK */}
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
                <span className="text-slate-500 font-mono text-[10px] font-bold">#</span>
                NIK (Nomor Induk Kependudukan)
              </label>
              <input
                type="text"
                placeholder="Contoh: 3171012345670001"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Nomor Telepon */}
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

          {/* Jenis SIM & Status Awal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Jenis SIM *
                </span>
                <span className="text-[10px] text-blue-600 font-mono">Master SIM</span>
              </label>
              <select
                value={simType}
                onChange={(e) => setSimType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {masterSimTypes.length > 0 ? (
                  masterSimTypes.map((s) => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))
                ) : (
                  <>
                    <option value="SIM A">SIM A (Mobil Pribadi/Barang &lt;3.5t)</option>
                    <option value="SIM B1">SIM B1 (Bus & Truk Perseorangan)</option>
                    <option value="SIM B2">SIM B2 (Alat Berat & Gandengan)</option>
                    <option value="SIM B1 Umum">SIM B1 Umum (Angkutan Umum/Barang)</option>
                    <option value="SIM B2 Umum">SIM B2 Umum (Kontainer/Gandengan)</option>
                    <option value="SIM C">SIM C (Sepeda Motor)</option>
                  </>
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

          {/* Pilihan Cabang / Hub Operasional (Master Cabang) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Pilih Cabang / Hub Armada
              </span>
              <span className="text-[10px] text-indigo-600 font-mono font-medium">Master Cabang</span>
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors cursor-pointer text-xs"
            >
              <option value="">-- Pilih Cabang Penempatan (Opsional) --</option>
              {masterBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.name} ({b.city})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Tentukan cabang operasional tempat driver bertugas dan standby armada.
            </p>
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
              Catatan / Keterangan Driver
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Driver berpengalaman rute antarkota, siap lembur..."
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
