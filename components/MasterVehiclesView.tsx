'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Car, Plus, Edit, Trash2, CheckCircle2, X, AlertCircle, Weight } from 'lucide-react';

interface VehicleTypeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  maxWeightCapacity?: number;
  description?: string;
  driverCount?: number;
}

export const MasterVehiclesView: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleTypeItem | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleTypeItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Motor');
  const [maxWeightCapacity, setMaxWeightCapacity] = useState('25');
  const [description, setDescription] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch('/api/master/vehicles');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setVehicles(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenAdd = () => {
    setVehicleToEdit(null);
    setCode('');
    setName('');
    setCategory('Motor');
    setMaxWeightCapacity('25');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: VehicleTypeItem) => {
    setVehicleToEdit(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category || 'Motor');
    setMaxWeightCapacity(item.maxWeightCapacity ? String(item.maxWeightCapacity) : '0');
    setDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      maxWeightCapacity: parseFloat(maxWeightCapacity) || 0,
      description: description.trim(),
    };

    try {
      if (vehicleToEdit) {
        const res = await fetch('/api/master/vehicles', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: vehicleToEdit.id, ...payload }),
        });
        if (res.ok) {
          showToast('Jenis kendaraan berhasil diperbarui!');
          fetchVehicles();
          setIsModalOpen(false);
        }
      } else {
        const res = await fetch('/api/master/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast('Jenis kendaraan baru berhasil ditambahkan!');
          fetchVehicles();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      const res = await fetch(`/api/master/vehicles?id=${vehicleToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Jenis kendaraan berhasil dihapus!');
        fetchVehicles();
        setVehicleToDelete(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slide-up ring-2 ring-emerald-400/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Master Data Jenis Kendaraan
              </h2>
              <p className="text-xs text-slate-500">
                Kelola kategori armada operasional (Motor, Mobil Box, Truk, Pick-Up) dan spesifikasi kapasitas muat.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Kendaraan Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Jenis Kendaraan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-3 text-center">Maks. Beban (kg)</th>
                <th className="py-3.5 px-3 text-center">Driver Terhubung</th>
                <th className="py-3.5 px-4">Deskripsi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Memuat data kendaraan dari PostgreSQL...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada data kendaraan.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {v.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {v.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">
                      {v.maxWeightCapacity ?? 0} kg
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      {v.driverCount ?? 0} driver
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {v.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setVehicleToDelete(v)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {vehicleToEdit ? `Edit Kendaraan: ${vehicleToEdit.name}` : 'Tambah Jenis Kendaraan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Kendaraan (Unique) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TRUK-ENGKEL"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Jenis Kendaraan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Truk Engkel Box (Canter)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori Kendaraan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="Motor">Motor (Roda 2)</option>
                    <option value="Mobil Box">Mobil Box</option>
                    <option value="Pick-Up">Pick-Up Bak Terbuka</option>
                    <option value="Truk">Truk Muatan Besar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5 text-emerald-600" />
                    Kapasitas Beban (kg)
                  </label>
                  <input
                    type="number"
                    value={maxWeightCapacity}
                    onChange={(e) => setMaxWeightCapacity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan / Deskripsi
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan peruntukan muatan kendaraan ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Simpan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Jenis Kendaraan?</h4>
                <p className="text-slate-500">Kendaraan <strong>{vehicleToDelete.name}</strong> akan dihapus dari sistem.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setVehicleToDelete(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
