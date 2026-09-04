'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Driver, 
  Order, 
  DriverStatus, 
  KPIData, 
  TimeFrame, 
  TaskHistoryItem 
} from '@/types/dispatcher';
import { INITIAL_DRIVERS, INITIAL_ORDERS } from '@/data/initialData';
import { Header } from '@/components/Header';
import { AlertBanner } from '@/components/AlertBanner';
import { KPICards } from '@/components/KPICards';
import { ChartsSection } from '@/components/ChartsSection';
import { DriverMonitoringTable } from '@/components/DriverMonitoringTable';
import { Sidebar, NavigationTab } from '@/components/Sidebar';
import { MasterStatusView } from '@/components/MasterStatusView';
import { MasterVehiclesView } from '@/components/MasterVehiclesView';
import { MasterBranchesView } from '@/components/MasterBranchesView';
import { MasterCargoTypesView } from '@/components/MasterCargoTypesView';
import { NewOrderModal } from '@/components/NewOrderModal';
import { DriverHistoryModal } from '@/components/DriverHistoryModal';
import { ExportModal } from '@/components/ExportModal';
import { UnassignedOrdersModal } from '@/components/UnassignedOrdersModal';
import { DriverFormModal } from '@/components/DriverFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Truck, CheckCircle2, Database, RefreshCw } from 'lucide-react';

export default function DispatcherDashboardPage() {
  // Main State (loaded from PostgreSQL)
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Filter States (Poin 6.1 & 6.2)
  const [selectedBranch, setSelectedBranch] = useState<string>('Semua Cabang');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('harian');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const tabMeta: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'DASHBOARD OVERVIEW',
      subtitle: 'Ringkasan Ketersediaan Armada, Aktivitas Order & Metrik Kinerja Logistik',
    },
    drivers: {
      title: 'MONITORING DRIVER & TUGAS',
      subtitle: 'Manajemen Data Driver Armada, Status Real-Time, Penugasan Cepat & Riwayat Tugas',
    },
    'master-status': {
      title: 'MASTER DATA STATUS DRIVER',
      subtitle: 'Kelola Status Operasional Driver yang Terhubung Langsung ke Database PostgreSQL',
    },
    'master-vehicles': {
      title: 'MASTER DATA JENIS KENDARAAN',
      subtitle: 'Kelola Tipe Armada, Kapasitas Muatan & Spesifikasi Kendaraan Logistik',
    },
    'master-branches': {
      title: 'MASTER DATA CABANG & HUB',
      subtitle: 'Kelola Titik Hub Operasional dan Wilayah Layanan Pengiriman',
    },
    'master-cargo-types': {
      title: 'MASTER DATA JENIS MUATAN & PAKET',
      subtitle: 'Kelola Klasifikasi Jenis Muatan, Penanganan Khusus & Relasi Order Pengiriman',
    },
  };

  // Modal States
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUnassignedOpen, setIsUnassignedOpen] = useState(false);
  const [selectedDriverForHistory, setSelectedDriverForHistory] = useState<Driver | null>(null);
  const [preSelectedDriverForOrder, setPreSelectedDriverForOrder] = useState<Driver | null>(null);

  // Driver CRUD Modal States
  const [isDriverFormOpen, setIsDriverFormOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  // Success notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch data from PostgreSQL via Next.js API
  const fetchDatabaseData = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsSyncing(true);
    try {
      const [driversRes, ordersRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/orders'),
      ]);

      if (driversRes.ok) {
        const driversData = await driversRes.json();
        if (driversData.success && Array.isArray(driversData.data)) {
          setDrivers(driversData.data);
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && Array.isArray(ordersData.data)) {
          setOrders(ordersData.data);
        }
      }
    } catch (err) {
      console.warn('Menggunakan fallback data lokal:', err);
    } finally {
      setIsLoading(false);
      if (showIndicator) setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDatabaseData();
  }, [fetchDatabaseData]);

  // Branch filtered drivers
  const branchFilteredDrivers = useMemo(() => {
    if (selectedBranch === 'Semua Cabang') return drivers;
    return drivers.filter((d) => d.branch === selectedBranch);
  }, [drivers, selectedBranch]);

  // Table filtered drivers (Search + Status + Branch)
  const displayDrivers = useMemo(() => {
    return branchFilteredDrivers.filter((driver) => {
      const matchStatus = selectedStatus === 'Semua' || driver.status === selectedStatus;
      const matchSearch =
        searchQuery.trim() === '' ||
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [branchFilteredDrivers, selectedStatus, searchQuery]);

  // Unassigned orders
  const unassignedOrders = useMemo(() => {
    return orders.filter((o) => {
      const isUnassigned = o.status === 'Belum Ditugaskan' || !o.assignedDriverId;
      const matchBranch = selectedBranch === 'Semua Cabang' || o.branch === selectedBranch;
      return isUnassigned && matchBranch;
    });
  }, [orders, selectedBranch]);

  // Standby / Available drivers
  const readyDriversList = useMemo(() => {
    return branchFilteredDrivers.filter((d) => d.status === 'Ready');
  }, [branchFilteredDrivers]);

  // Calculate dynamic KPI metrics
  const kpiData: KPIData = useMemo(() => {
    const totalDrivers = branchFilteredDrivers.length;
    const readyDrivers = branchFilteredDrivers.filter((d) => d.status === 'Ready').length;
    const tripDrivers = branchFilteredDrivers.filter((d) => d.status === 'Trip').length;
    const waitingAssignmentDrivers = branchFilteredDrivers.filter(
      (d) => d.status === 'Menunggu Assignment'
    ).length;
    const offOrLeaveDrivers = branchFilteredDrivers.filter(
      (d) => d.status === 'Izin' || d.status === 'Off'
    ).length;

    const ordersCompleted = branchFilteredDrivers.reduce((acc, d) => acc + d.completedTasks, 0);
    const ordersInProgress = branchFilteredDrivers.reduce((acc, d) => acc + d.inProgressTasks, 0);
    const ordersReceived = branchFilteredDrivers.reduce((acc, d) => acc + d.pendingTasks, 0);
    const ordersCancelled = branchFilteredDrivers.reduce((acc, d) => acc + d.cancelledTasks, 0);
    const ordersUnassigned = unassignedOrders.length;

    const totalOrders = ordersCompleted + ordersInProgress + ordersReceived + ordersCancelled + ordersUnassigned;

    // Target orders based on time frame (Poin 6.9 & 6.11)
    const targetMap: Record<TimeFrame, number> = {
      harian: 35,
      mingguan: 240,
      bulanan: 980,
    };
    const targetOrders = targetMap[timeFrame];
    const realizationRate = Math.round((ordersCompleted / (targetOrders || 1)) * 100);

    return {
      totalDrivers,
      readyDrivers,
      tripDrivers,
      offOrLeaveDrivers,
      waitingAssignmentDrivers,
      totalOrders,
      ordersReceived,
      ordersInProgress,
      ordersCompleted,
      ordersUnassigned,
      ordersCancelled,
      targetOrders,
      realizationRate,
    };
  }, [branchFilteredDrivers, unassignedOrders, timeFrame]);

  // Handler: Change driver status directly with PostgreSQL persistence
  const handleChangeDriverStatus = async (driverId: string, newStatus: DriverStatus) => {
    // 1. Optimistic UI update
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            status: newStatus,
            notes:
              newStatus === 'Izin'
                ? 'Izin tidak bertugas (Diperbarui via Dispatcher)'
                : newStatus === 'Off'
                ? 'Jadwal Libur/Off'
                : d.notes,
          };
        }
        return d;
      })
    );

    // 2. Persist to PostgreSQL API
    try {
      const res = await fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          status: newStatus,
          notes:
            newStatus === 'Izin'
              ? 'Izin tidak bertugas (Diperbarui via Dispatcher)'
              : newStatus === 'Off'
              ? 'Jadwal Libur/Off'
              : undefined,
        }),
      });

      if (res.ok) {
        showToast(`Status ${driverId} disimpan ke PostgreSQL: ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update status in DB:', err);
    }
  };

  // Handler: Save Driver Profile (Create or Edit)
  const handleSaveDriverProfile = async (driverData: Partial<Driver>) => {
    const isEdit = !!driverData.id;

    try {
      const res = await fetch('/api/drivers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          if (isEdit) {
            setDrivers((prev) =>
              prev.map((d) => (d.id === result.data.id ? { ...d, ...result.data } : d))
            );
            showToast(`Data driver ${result.data.name} berhasil diperbarui di PostgreSQL!`);
          } else {
            setDrivers((prev) => [result.data, ...prev]);
            showToast(`Driver baru ${result.data.name} (${result.data.id}) berhasil didaftarkan ke PostgreSQL!`);
          }
        }
      } else {
        alert('Gagal menyimpan data driver.');
      }
    } catch (err) {
      console.error('Failed to save driver profile:', err);
    }
  };

  // Handler: Delete Driver
  const handleConfirmDeleteDriver = async (driverId: string) => {
    try {
      const res = await fetch(`/api/drivers?id=${driverId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDrivers((prev) => prev.filter((d) => d.id !== driverId));
        showToast(`Driver ${driverId} berhasil dihapus dari PostgreSQL.`);
        // Refresh orders as some might have become unassigned
        fetchDatabaseData();
      } else {
        alert('Gagal menghapus driver.');
      }
    } catch (err) {
      console.error('Failed to delete driver:', err);
    }
  };

  // Handler: Create & Assign new order with PostgreSQL persistence
  const handleSaveNewOrder = async (newOrder: Order) => {
    // 1. Optimistic UI update
    setOrders((prev) => [newOrder, ...prev]);

    if (newOrder.assignedDriverId) {
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const newTaskHistory: TaskHistoryItem = {
        id: `TSK-${Date.now()}`,
        orderNumber: newOrder.orderNumber,
        customer: newOrder.customer,
        pickupLocation: newOrder.pickupLocation,
        dropoffLocation: newOrder.dropoffLocation,
        startTime: now,
        endTime: '-',
        status: 'Berjalan',
        notes: newOrder.notes || 'Ditugaskan langsung via Dispatcher',
      };

      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === newOrder.assignedDriverId) {
            return {
              ...d,
              status: 'Trip',
              totalTasks: d.totalTasks + 1,
              inProgressTasks: d.inProgressTasks + 1,
              taskHistory: [newTaskHistory, ...d.taskHistory],
            };
          }
          return d;
        })
      );
    }

    // 2. Save to PostgreSQL
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        showToast(`Order ${newOrder.orderNumber} tersimpan permanen di PostgreSQL!`);
        fetchDatabaseData();
      }
    } catch (err) {
      console.error('Failed to create order in DB:', err);
    }
  };

  // Handler: Assign unassigned order to a driver with PostgreSQL persistence
  const handleAssignOrderToDriver = async (orderId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newTaskHistory: TaskHistoryItem = {
      id: `TSK-${Date.now()}`,
      orderNumber: targetOrder.orderNumber,
      customer: targetOrder.customer,
      pickupLocation: targetOrder.pickupLocation,
      dropoffLocation: targetOrder.dropoffLocation,
      startTime: now,
      endTime: '-',
      status: 'Berjalan',
      notes: targetOrder.notes || 'Penugasan cepat dispatcher',
    };

    // 1. Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Berjalan',
              assignedDriverId: driver.id,
              assignedDriverName: driver.name,
            }
          : o
      )
    );

    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: 'Trip',
              totalTasks: d.totalTasks + 1,
              inProgressTasks: d.inProgressTasks + 1,
              taskHistory: [newTaskHistory, ...d.taskHistory],
            }
          : d
      )
    );

    // 2. Persist to PostgreSQL
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, driverId }),
      });

      if (res.ok) {
        showToast(`Order ${targetOrder.orderNumber} berhasil ditugaskan & disimpan di PostgreSQL!`);
        fetchDatabaseData();
      }
    } catch (err) {
      console.error('Failed to assign order in DB:', err);
    }
  };

  const handleQuickAssignFromTable = (driver: Driver) => {
    setPreSelectedDriverForOrder(driver);
    setIsNewOrderOpen(true);
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex bg-[#090d16] text-slate-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slide-up ring-2 ring-emerald-400/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        driverCount={drivers.length}
        unassignedCount={unassignedOrders.length}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header Bar */}
        <Header
          title={tabMeta[activeTab].title}
          subtitle={tabMeta[activeTab].subtitle}
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          timeFrame={timeFrame}
          onChangeTimeFrame={setTimeFrame}
          unassignedCount={unassignedOrders.length}
          readyDriverCount={readyDriversList.length}
          onOpenNewOrder={() => {
            setPreSelectedDriverForOrder(null);
            setIsNewOrderOpen(true);
          }}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenUnassignedList={() => setIsUnassignedOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* PostgreSQL Database Status Bar & Manual Refresh */}
          <div className="mb-4 flex items-center justify-between bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Database:</span>
              <span className="text-emerald-400 font-mono">PostgreSQL 18 (dashboard_dispatcher)</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Data terhubung & tersimpan permanen</span>
            </div>

            <button
              onClick={() => fetchDatabaseData(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-all active:scale-95"
              title="Sinkronisasi ulang dengan database PostgreSQL"
            >
              <RefreshCw className={`w-3 h-3 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Refresh Data'}</span>
            </button>
          </div>

          {/* TAB 1: Dashboard Overview (Tabel monitoring driver telah dipisahkan ke tab tersendiri) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Peringatan & Notifikasi Dispatcher (Poin 6.7 & 6.8) */}
              <AlertBanner
                unassignedCount={unassignedOrders.length}
                readyDriverCount={readyDriversList.length}
                onOpenNewOrder={() => {
                  setPreSelectedDriverForOrder(null);
                  setIsNewOrderOpen(true);
                }}
                onScrollToTable={() => setActiveTab('drivers')}
              />

              {/* Bagian Atas: Indikator KPI Utama (Poin 3 & Poin 7) */}
              <KPICards 
                kpi={kpiData} 
                onFilterStatus={(status) => {
                  setSelectedStatus(status);
                  setActiveTab('drivers');
                }} 
              />

              {/* Bagian Tengah: Visualisasi Grafik & Leaderboard (Poin 2.5, 7, 6.9, 6.10) */}
              <ChartsSection
                drivers={branchFilteredDrivers}
                kpi={kpiData}
                onSelectDriverForHistory={(driver) => setSelectedDriverForHistory(driver)}
              />
            </div>
          )}

          {/* TAB 2: Monitoring Driver & Tugas (Menu baru terpisah dari dashboard) */}
          {activeTab === 'drivers' && (
            <div ref={tableRef}>
              <DriverMonitoringTable
                drivers={displayDrivers}
                selectedStatus={selectedStatus}
                onSelectStatus={setSelectedStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectDriverForHistory={(driver) => setSelectedDriverForHistory(driver)}
                onQuickAssign={handleQuickAssignFromTable}
                onChangeDriverStatus={handleChangeDriverStatus}
                onOpenAddDriver={() => {
                  setDriverToEdit(null);
                  setIsDriverFormOpen(true);
                }}
                onEditDriver={(driver) => {
                  setDriverToEdit(driver);
                  setIsDriverFormOpen(true);
                }}
                onDeleteDriver={(driver) => {
                  setDriverToDelete(driver);
                }}
              />
            </div>
          )}

          {/* TAB 3: Master Data Status (Terhubung ke Table Driver) */}
          {activeTab === 'master-status' && (
            <MasterStatusView />
          )}

          {/* TAB 4: Master Data Jenis Kendaraan (Terhubung ke Table Driver) */}
          {activeTab === 'master-vehicles' && (
            <MasterVehiclesView />
          )}

          {/* TAB 5: Master Data Cabang (Terhubung ke Table Driver) */}
          {activeTab === 'master-branches' && (
            <MasterBranchesView />
          )}

          {/* TAB 6: Master Data Jenis Muatan (Terhubung ke Table Order) */}
          {activeTab === 'master-cargo-types' && (
            <MasterCargoTypesView />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-slate-400">Dashboard Monitoring Driver & Dispatcher Engine</span>
            </div>
            <div className="text-slate-400">
              Terhubung ke PostgreSQL Database • Master Data Relasional Aktif
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <DriverFormModal
        isOpen={isDriverFormOpen}
        onClose={() => setIsDriverFormOpen(false)}
        driverToEdit={driverToEdit}
        onSaveDriver={handleSaveDriverProfile}
      />

      <DeleteConfirmModal
        isOpen={!!driverToDelete}
        driver={driverToDelete}
        onClose={() => setDriverToDelete(null)}
        onConfirmDelete={handleConfirmDeleteDriver}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        drivers={drivers}
        preSelectedDriver={preSelectedDriverForOrder}
        onSaveOrder={handleSaveNewOrder}
      />

      <DriverHistoryModal
        isOpen={!!selectedDriverForHistory}
        driver={selectedDriverForHistory}
        onClose={() => setSelectedDriverForHistory(null)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        drivers={branchFilteredDrivers}
        kpi={kpiData}
        currentTimeFrame={timeFrame}
        selectedBranch={selectedBranch}
      />

      <UnassignedOrdersModal
        isOpen={isUnassignedOpen}
        onClose={() => setIsUnassignedOpen(false)}
        unassignedOrders={unassignedOrders}
        availableDrivers={branchFilteredDrivers.filter(
          (d) => d.status === 'Ready' || d.status === 'Menunggu Assignment'
        )}
        onAssignOrderToDriver={handleAssignOrderToDriver}
      />

    </div>
  );
}
