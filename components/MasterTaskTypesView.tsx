'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  ShieldAlert, 
  Search,
  RefreshCw,
  Clock,
  ArrowRightCircle,
  ArrowLeftCircle
} from 'lucide-react';
import { TaskTypeItem } from '@/types/dispatcher';

export const MasterTaskTypesView: React.FC = () => {
  const [taskTypes, setTaskTypes] = useState<TaskTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskTypeItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskTypeItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTaskTypes = useCallback(async () => {
    try {
      const res = await fetch('/api/master/task-types');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTaskTypes(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch task types:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskTypes();
  }, [fetchTaskTypes]);

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setCode('');
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TaskTypeItem) => {
    setTaskToEdit(item);
    setCode(item.code);
    setName(item.name);
    setDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!taskToEdit;

    const payload = {
      ...(isEdit ? { id: taskToEdit.id } : {}),
      code,
      name,
      description,
    };

    try {
      const res = await fetch('/api/master/task-types', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        showToast(`Jenis tugas "${name}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        fetchTaskTypes();
      } else {
        const errJson = await res.json();
        alert(errJson.error || 'Gagal menyimpan jenis tugas.');
      }
    } catch (err) {
      console.error('Failed to save task type:', err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const res = await fetch(`/api/master/task-types?id=${taskToDelete.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Jenis tugas "${taskToDelete.name}" berhasil dihapus.`);
        setTaskToDelete(null);
        fetchTaskTypes();
      } else {
        alert(json.error || 'Gagal menghapus jenis tugas.');
      }
    } catch (err) {
      console.error('Failed to delete task type:', err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // Filtered list
  const filteredTaskTypes = taskTypes.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      q === '' ||
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
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
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Master Data Jenis Tugas
            </h2>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              Relasi: Order Table
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Data referensi 4 penugasan utama armada dispatcher: <strong>Replace</strong>, <strong>Short Term</strong>, <strong>Antar Short Term</strong>, dan <strong>Tarik Short Term</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Jenis Tugas</span>
        </button>
      </div>

      {/* 4 Task Type Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Tugas Replace</div>
            <div className="text-sm font-bold text-slate-900">Ganti Unit</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Short Term</div>
            <div className="text-sm font-bold text-slate-900">Dinas Jangka Pendek</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <ArrowRightCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Antar Short Term</div>
            <div className="text-sm font-bold text-slate-900">Antar Unit</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <ArrowLeftCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Tarik Short Term</div>
            <div className="text-sm font-bold text-slate-900">Penarikan Unit</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari jenis tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-900">{taskTypes.length}</span> Jenis Tugas Terdaftar
        </div>
      </div>

      {/* Task Types Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Kode Tugas</th>
                <th className="px-4 py-3">Nama Jenis Tugas</th>
                <th className="px-4 py-3">Deskripsi Operasional</th>
                <th className="px-4 py-3">Order Terhubung</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Memuat data master jenis tugas...
                  </td>
                </tr>
              ) : filteredTaskTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada jenis tugas yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredTaskTypes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-slate-800">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        {item.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-md">
                      {item.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.orderCount || 0} Order
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-amber-600 transition-colors"
                          title="Edit Jenis Tugas"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Jenis Tugas"
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
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {taskToEdit ? 'Edit Jenis Tugas' : 'Tambah Jenis Tugas Baru'}
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
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Kode Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REPLACE / SHORT_TERM"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white uppercase transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Jenis Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Replace / Short Term"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Deskripsi Operasional</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan peruntukan penugasan armada..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition-colors"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                Jenis tugas ini akan langsung tersedia pada formulir pemesanan order baru di dashboard dispatcher.
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
                  {taskToEdit ? 'Simpan Perubahan' : 'Tambah Jenis Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hapus Jenis Tugas?</h4>
                <p className="text-[11px] text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-slate-600">
              Apakah Anda yakin ingin menghapus jenis tugas{' '}
              <strong className="text-slate-900">
                {taskToDelete.name} ({taskToDelete.code})
              </strong>{' '}
              dari database?
            </p>

            {(taskToDelete.orderCount || 0) > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Perhatian: Terdapat {taskToDelete.orderCount} order yang menggunakan jenis tugas ini. Anda tidak dapat menghapusnya sebelum order dialihkan.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={(taskToDelete.orderCount || 0) > 0}
                className={`px-3 py-1.5 rounded-lg text-white font-semibold transition-all ${
                  (taskToDelete.orderCount || 0) > 0
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
