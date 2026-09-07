'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  ShieldAlert, 
  FileText, 
  Utensils, 
  Layers, 
  Sparkles,
  Search
} from 'lucide-react';

interface CargoTypeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  handlingInstruction?: string;
  description?: string;
  orderCount?: number;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  Standard: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Layers,
  },
  Dokumen: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: FileText,
  },
  Sensitif: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: ShieldAlert,
  },
  Makanan: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Utensils,
  },
  Khusus: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Sparkles,
  },
};

export const MasterCargoTypesView: React.FC = () => {
  const [cargoTypes, setCargoTypes] = useState<CargoTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cargoToEdit, setCargoToEdit] = useState<CargoTypeItem | null>(null);
  const [cargoToDelete, setCargoToDelete] = useState<CargoTypeItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Standard');
  const [handlingInstruction, setHandlingInstruction] = useState('');
  const [description, setDescription] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCargoTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/master/cargo-types');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCargoTypes(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch cargo types:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCargoTypes();
  }, [fetchCargoTypes]);

  const handleOpenAdd = () => {
    setCargoToEdit(null);
    setCode('');
    setName('');
    setCategory('Standard');
    setHandlingInstruction('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CargoTypeItem) => {
    setCargoToEdit(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category || 'Standard');
    setHandlingInstruction(item.handlingInstruction || '');
    setDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!cargoToEdit;

    const payload = {
      ...(isEdit ? { id: cargoToEdit.id } : {}),
      code,
      name,
      category,
      handlingInstruction,
      description,
    };

    try {
      const res = await fetch('/api/master/cargo-types', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        showToast(`Jenis muatan "${name}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'} di PostgreSQL!`);
        fetchCargoTypes();
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Gagal menyimpan jenis muatan.');
      }
    } catch (err) {
      console.error('Error saving cargo type:', err);
      alert('Terjadi kesalahan saat menyimpan data.');
    }
  };

  const handleDelete = async () => {
    if (!cargoToDelete) return;

    try {
      const res = await fetch(`/api/master/cargo-types?id=${cargoToDelete.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCargoToDelete(null);
        showToast(`Jenis muatan "${cargoToDelete.name}" berhasil dihapus.`);
        fetchCargoTypes();
      } else {
        alert(json.error || 'Gagal menghapus jenis muatan.');
      }
    } catch (err) {
      console.error('Error deleting cargo type:', err);
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  // Filtered Cargo Types
  const filteredCargoTypes = cargoTypes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.handlingInstruction && c.handlingInstruction.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat =
      selectedCategoryFilter === 'Semua' || c.category === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Master Data Jenis Muatan & Paket
            </h2>
            <span className="text-[10px] font-mono bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
              Relasi: Order Table
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tabel referensi jenis muatan yang terhubung langsung ke kolom <code className="text-orange-600 font-mono">cargoTypeId</code> pada setiap pesanan pengiriman (PostgreSQL 18).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Jenis Muatan</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Total Jenis Muatan</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{cargoTypes.length} Tipe</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Dokumen & Standard</div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {cargoTypes.filter((c) => c.category === 'Standard' || c.category === 'Dokumen').length} Tipe
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Sensitif & Medis</div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {cargoTypes.filter((c) => c.category === 'Sensitif').length} Tipe
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Makanan & Khusus</div>
            <div className="text-lg font-bold text-slate-900 font-mono">
              {cargoTypes.filter((c) => c.category === 'Makanan' || c.category === 'Khusus').length} Tipe
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode, nama muatan, instruksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-500 shrink-0 text-[11px]">Kategori:</span>
          {['Semua', 'Standard', 'Dokumen', 'Sensitif', 'Makanan', 'Khusus'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                selectedCategoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cargo Types Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Kode Muatan</th>
                <th className="px-4 py-3">Nama Jenis Muatan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Instruksi Penanganan</th>
                <th className="px-4 py-3">Order Terhubung</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Memuat data master jenis muatan dari PostgreSQL...
                  </td>
                </tr>
              ) : filteredCargoTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada jenis muatan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredCargoTypes.map((item) => {
                  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Standard;
                  const Icon = catStyle.icon;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-slate-800">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{item.category}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-600 text-[11px] max-w-sm">
                          {item.handlingInstruction || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          {item.orderCount || 0} Order Aktif
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600 transition-colors"
                            title="Edit Jenis Muatan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCargoToDelete(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Hapus Jenis Muatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  {cargoToEdit ? 'Edit Jenis Muatan' : 'Tambah Jenis Muatan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kode Muatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FRAGILE"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white uppercase transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Dokumen">Dokumen</option>
                    <option value="Sensitif">Sensitif</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Khusus">Khusus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Jenis Muatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elektronik & Pecah Belah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Instruksi Penanganan Khusus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jangan dibanting, simpan di tempat kering"
                  value={handlingInstruction}
                  onChange={(e) => setHandlingInstruction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan spesifikasi muatan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition-colors"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                Data jenis muatan ini akan langsung tersedia pada formulir pemesanan order baru dan terhubung ke PostgreSQL.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                >
                  {cargoToEdit ? 'Simpan Perubahan' : 'Tambah Jenis Muatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {cargoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Jenis Muatan?</h4>
                <p className="text-[11px] text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-slate-600">
              Apakah Anda yakin ingin menghapus jenis muatan{' '}
              <strong className="text-slate-900">
                {cargoToDelete.name} ({cargoToDelete.code})
              </strong>{' '}
              dari database PostgreSQL?
            </p>

            {(cargoToDelete.orderCount || 0) > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Perhatian: Terdapat {cargoToDelete.orderCount} order yang menggunakan jenis muatan ini. Anda tidak dapat menghapusnya sebelum order dialihkan.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCargoToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={(cargoToDelete.orderCount || 0) > 0}
                className={`px-3 py-1.5 rounded-lg text-white font-semibold transition-all ${
                  (cargoToDelete.orderCount || 0) > 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20'
                }`}
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
