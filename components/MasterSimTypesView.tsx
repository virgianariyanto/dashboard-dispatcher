'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Edit, Trash2, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { SimTypeItem } from '@/types/dispatcher';

export const MasterSimTypesView: React.FC = () => {
  const [simTypes, setSimTypes] = useState<SimTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simToEdit, setSimToEdit] = useState<SimTypeItem | null>(null);
  const [simToDelete, setSimToDelete] = useState<SimTypeItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Kendaraan Ringan');
  const [description, setDescription] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSimTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/master/sim-types');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSimTypes(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch SIM types:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSimTypes();
  }, [fetchSimTypes]);

  const handleOpenAdd = () => {
    setSimToEdit(null);
    setCode('');
    setName('');
    setCategory('Kendaraan Ringan');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SimTypeItem) => {
    setSimToEdit(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category || 'Kendaraan Ringan');
    setDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      description: description.trim(),
    };

    try {
      if (simToEdit) {
        const res = await fetch('/api/master/sim-types', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: simToEdit.id, ...payload }),
        });
        if (res.ok) {
          showToast('Jenis SIM berhasil diperbarui!');
          fetchSimTypes();
          setIsModalOpen(false);
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal memperbarui jenis SIM');
        }
      } else {
        const res = await fetch('/api/master/sim-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showToast('Jenis SIM baru berhasil ditambahkan!');
          fetchSimTypes();
          setIsModalOpen(false);
        } else {
          const err = await res.json();
          alert(err.error || 'Gagal menambahkan jenis SIM');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDelete = async () => {
    if (!simToDelete) return;
    try {
      const res = await fetch(`/api/master/sim-types?id=${simToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Jenis SIM berhasil dihapus!');
        fetchSimTypes();
        setSimToDelete(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification */}
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
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Master Data Jenis SIM
              </h2>
              <p className="text-xs text-slate-500">
                Kelola klasifikasi lisensi mengemudi pengemudi (SIM A, SIM B1, SIM B2, SIM C) dan peruntukannya.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Jenis SIM</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Kode SIM</th>
                <th className="py-3.5 px-4">Nama Jenis SIM</th>
                <th className="py-3.5 px-4">Golongan / Kategori</th>
                <th className="py-3.5 px-3 text-center">Driver Terhubung</th>
                <th className="py-3.5 px-4">Deskripsi Peruntukan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Memuat data master jenis SIM...
                  </td>
                </tr>
              ) : simTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Belum ada data jenis SIM.
                  </td>
                </tr>
              ) : (
                simTypes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {s.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {s.driverCount ?? 0} driver
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-sm truncate">
                      {s.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Edit Jenis SIM"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSimToDelete(s)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Hapus Jenis SIM"
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
                {simToEdit ? `Edit Jenis SIM: ${simToEdit.name}` : 'Tambah Jenis SIM Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kode SIM (Unique) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SIM-A"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Jenis SIM *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SIM A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Golongan / Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Sepeda Motor (Roda 2)">Sepeda Motor (Roda 2)</option>
                  <option value="Kendaraan Ringan">Kendaraan Ringan</option>
                  <option value="Mobil Penumpang & Barang Perseorangan">Mobil Penumpang & Barang Perseorangan</option>
                  <option value="Mobil Bus & Barang Perseorangan">Mobil Bus & Barang Perseorangan</option>
                  <option value="Mobil Bus & Angkutan Umum">Mobil Bus & Angkutan Umum</option>
                  <option value="Kendaraan Alat Berat & Gandengan">Kendaraan Alat Berat & Gandengan</option>
                  <option value="Kendaraan Penarik / Kontainer Umum">Kendaraan Penarik / Kontainer Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi / Peruntukan SIM
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan batasan berat atau kapasitas kendaraan untuk jenis SIM ini..."
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
                  Simpan Jenis SIM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {simToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Jenis SIM?</h4>
                <p className="text-slate-500">Jenis SIM <strong>{simToDelete.name}</strong> akan dihapus dari sistem.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSimToDelete(null)}
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
