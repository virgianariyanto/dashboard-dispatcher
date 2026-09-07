'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit, Trash2, CheckCircle2, X, AlertCircle, MapPin, Phone } from 'lucide-react';

interface BranchItem {
  id: string;
  code: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  driverCount?: number;
  orderCount?: number;
}

export const MasterBranchesView: React.FC = () => {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<BranchItem | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<BranchItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/master/branches');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBranches(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleOpenAdd = () => {
    setBranchToEdit(null);
    setCode('');
    setName('');
    setCity('');
    setPhone('');
    setAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BranchItem) => {
    setBranchToEdit(item);
    setCode(item.code);
    setName(item.name);
    setCity(item.city);
    setPhone(item.phone || '');
    setAddress(item.address || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!branchToEdit;

    const payload = {
      ...(isEdit ? { id: branchToEdit.id } : {}),
      code,
      name,
      city,
      phone,
      address,
    };

    try {
      const res = await fetch('/api/master/branches', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        showToast(`Cabang "${name}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'} di PostgreSQL!`);
        fetchBranches();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan cabang');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;
    try {
      const res = await fetch(`/api/master/branches?id=${branchToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBranchToDelete(null);
        showToast(`Cabang "${branchToDelete.name}" berhasil dihapus.`);
        fetchBranches();
      } else {
        alert('Gagal menghapus cabang');
      }
    } catch (err) {
      console.error(err);
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
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Master Data Cabang Operasional
              </h2>
              <p className="text-xs text-slate-500">
                Kelola data cabang/hub logistik regional yang menaungi personil driver dan order penugasan.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Cabang Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Cabang</th>
                <th className="py-3.5 px-4">Kota</th>
                <th className="py-3.5 px-4">Telepon</th>
                <th className="py-3.5 px-3 text-center">Driver Terhubung</th>
                <th className="py-3.5 px-4">Alamat Hub</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Memuat data cabang dari PostgreSQL...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada data cabang.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {b.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {b.name}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {b.city}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {b.phone || '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                        {b.driverCount ?? 0} driver
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {b.address || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-amber-600 rounded-lg transition-all"
                          title="Edit Cabang"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBranchToDelete(b)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                          title="Hapus Cabang"
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
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="text-sm font-bold text-slate-900">
                {branchToEdit ? `Edit Cabang: ${branchToEdit.name}` : 'Tambah Cabang Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Kode Cabang (Unique) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMG-HUB"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono uppercase placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Nama Cabang / Hub *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Semarang Pusat"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    Kota Operasional *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Semarang"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-600" />
                    Telepon / Hotline
                  </label>
                  <input
                    type="text"
                    placeholder="024-xxxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Alamat Lengkap Hub
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat fisik kantor / warehouse hub cabang..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition-colors"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-md shadow-blue-600/20 transition-all"
                >
                  Simpan Cabang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Cabang?</h4>
                <p className="text-slate-500">Cabang <strong className="text-slate-800">{branchToDelete.name}</strong> akan dihapus dari sistem.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setBranchToDelete(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition-colors"
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
