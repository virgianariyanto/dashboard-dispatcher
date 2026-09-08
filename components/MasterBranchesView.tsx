'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  ShieldAlert, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  UserCheck, 
  Truck, 
  ClipboardList,
  Layers,
  Filter
} from 'lucide-react';
import { BranchItem } from '@/types/dispatcher';

export const MasterBranchesView: React.FC = () => {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<BranchItem | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<BranchItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
    setAddress('');
    setPhone('');
    setEmail('');
    setManagerName('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BranchItem) => {
    setBranchToEdit(item);
    setCode(item.code);
    setName(item.name);
    setCity(item.city);
    setAddress(item.address || '');
    setPhone(item.phone || '');
    setEmail(item.email || '');
    setManagerName(item.managerName || '');
    setIsActive(item.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !name.trim() || !city.trim()) {
      setFormError('Kode Cabang, Nama Cabang, dan Kota wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const isEdit = !!branchToEdit;

    const payload = {
      ...(isEdit ? { id: branchToEdit.id } : {}),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      city: city.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      managerName: managerName.trim() || null,
      isActive,
    };

    try {
      const res = await fetch('/api/master/branches', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsModalOpen(false);
        showToast(`Cabang "${name}" berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        fetchBranches();
      } else {
        setFormError(json.error || 'Gagal menyimpan data cabang.');
      }
    } catch (err) {
      console.error('Failed to save branch:', err);
      setFormError('Terjadi kesalahan jaringan saat menyimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;

    try {
      const res = await fetch(`/api/master/branches?id=${branchToDelete.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Cabang "${branchToDelete.name}" berhasil dihapus.`);
        setBranchToDelete(null);
        fetchBranches();
      } else {
        alert(json.error || 'Gagal menghapus cabang.');
      }
    } catch (err) {
      console.error('Failed to delete branch:', err);
      alert('Terjadi gangguan jaringan.');
    }
  };

  // Filtered branch records
  const filteredBranches = branches.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      (item.managerName && item.managerName.toLowerCase().includes(q)) ||
      (item.address && item.address.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive) ||
      (statusFilter === 'inactive' && !item.isActive);

    return matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.isActive).length;
  const totalConnectedDrivers = branches.reduce((acc, curr) => acc + (curr.driverCount || 0), 0);
  const totalConnectedOrders = branches.reduce((acc, curr) => acc + (curr.orderCount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-slide-up ring-2 ring-emerald-400/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Master Data Cabang (Branch)
            </h2>
            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-bold">
              Tabel Database: Branch
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola data cabang operasional, hub logistik armada, wilayah coverage kota, serta kontak penanggung jawab kantor.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Cabang Baru</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Total Cabang</div>
            <div className="text-base font-black text-slate-900">{totalBranches} Hub</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Cabang Aktif</div>
            <div className="text-base font-black text-emerald-600">{activeBranches} Operasional</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Driver Terhubung</div>
            <div className="text-base font-black text-blue-600">{totalConnectedDrivers} Driver</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Order Terhubung</div>
            <div className="text-base font-black text-amber-600">{totalConnectedOrders} Order</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode, nama cabang, kota, PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              aria-label="Filter status cabang"
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Saja</option>
              <option value="inactive">Nonaktif Saja</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan: <span className="font-bold text-slate-900">{filteredBranches.length}</span> dari {totalBranches} Cabang
        </div>
      </div>

      {/* Branches Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Kode Cabang</th>
                <th className="px-4 py-3.5">Nama Cabang &amp; Kota</th>
                <th className="px-4 py-3.5">Kontak &amp; Alamat</th>
                <th className="px-4 py-3.5">PIC / Manager</th>
                <th className="px-4 py-3.5 text-center">Armada &amp; Order</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data master cabang dari database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-medium text-slate-600">Tidak ada data cabang ditemukan</p>
                      <p className="text-[11px] text-slate-400">
                        {searchQuery ? 'Coba sesuaikan kata kunci pencarian Anda.' : 'Klik tombol Tambah Cabang Baru di atas untuk mendaftarkan cabang.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Kode Cabang */}
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {branch.code}
                      </span>
                    </td>

                    {/* Nama Cabang & Kota */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-xs">
                        {branch.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{branch.city}</span>
                      </div>
                    </td>

                    {/* Kontak & Alamat */}
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        {branch.phone && (
                          <div className="flex items-center gap-1 text-slate-700">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{branch.email}</span>
                          </div>
                        )}
                        {branch.address && (
                          <div className="text-slate-400 truncate text-[10px] mt-0.5" title={branch.address}>
                            {branch.address}
                          </div>
                        )}
                        {!branch.phone && !branch.email && !branch.address && (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </div>
                    </td>

                    {/* PIC / Manager */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {branch.managerName ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{branch.managerName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Armanda & Order Terhubung */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Driver Terhubung">
                          {branch.driverCount ?? 0} driver
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Order Ditangani">
                          {branch.orderCount ?? 0} order
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {branch.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Nonaktif
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(branch)}
                          className="p-1.5 bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 hover:border-amber-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Edit Cabang"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBranchToDelete(branch)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer shadow-2xs"
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

      {/* Modal Add / Edit Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {branchToEdit ? `Edit Cabang: ${branchToEdit.name}` : 'Tambah Cabang Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Kode Cabang */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Cabang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JKT-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all uppercase"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Kode unik pengenal cabang</p>
                </div>

                {/* Kota */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kota / Wilayah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta Pusat"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Nama Cabang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Cabang / Hub <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cabang Jakarta Pusat (Hub Thamrin)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Kantor / Hub
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat jalan, nomor gedung, kelurahan/kecamatan..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Telepon */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="021-5551234 / 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Operasional Cabang
                  </label>
                  <input
                    type="email"
                    placeholder="hub.jakarta@dispatcher.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* PIC / Kepala Cabang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kepala Cabang / Hub Manager (PIC)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Hendra Wijaya"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Status Aktif Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">Status Aktif Cabang</span>
                    <p className="text-[11px] text-slate-500">Cabang aktif dapat dialokasikan armada driver dan penugasan order</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : branchToEdit ? 'Simpan Perubahan' : 'Tambah Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Hapus Cabang {branchToDelete.name}?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Tindakan ini akan menghapus data cabang <strong>{branchToDelete.code}</strong> secara permanen dari database.
              {((branchToDelete.driverCount ?? 0) > 0 || (branchToDelete.orderCount ?? 0) > 0) && (
                <span className="block mt-2 font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 text-[11px]">
                  Perhatian: Cabang ini terhubung ke {branchToDelete.driverCount ?? 0} driver dan {branchToDelete.orderCount ?? 0} order. Sistem akan menolak penghapusan sampai relasi dialihkan.
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setBranchToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Hapus Cabang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
