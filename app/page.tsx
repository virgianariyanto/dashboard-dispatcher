'use client';

import React, { useState, useMemo, useRef } from 'react';
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
import { NewOrderModal } from '@/components/NewOrderModal';
import { DriverHistoryModal } from '@/components/DriverHistoryModal';
import { ExportModal } from '@/components/ExportModal';
import { UnassignedOrdersModal } from '@/components/UnassignedOrdersModal';
import { Truck, CheckCircle2 } from 'lucide-react';

export default function DispatcherDashboardPage() {
  // Main State
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  
  // Filter States (Poin 6.1 & 6.2)
  const [selectedBranch, setSelectedBranch] = useState<string>('Semua Cabang');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('harian');

  // Modal States
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUnassignedOpen, setIsUnassignedOpen] = useState(false);
  const [selectedDriverForHistory, setSelectedDriverForHistory] = useState<Driver | null>(null);
  const [preSelectedDriverForOrder, setPreSelectedDriverForOrder] = useState<Driver | null>(null);

  // Success notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Handler: Change driver status directly
  const handleChangeDriverStatus = (driverId: string, newStatus: DriverStatus) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          return {
            ...d,
            status: newStatus,
            notes:
              newStatus === 'Izin'
                ? 'Izin tidak bertugas (Diperbarui oleh Dispatcher)'
                : newStatus === 'Off'
                ? 'Jadwal Libur/Off'
                : d.notes,
          };
        }
        return d;
      })
    );
    showToast(`Status ${driverId} berhasil diubah menjadi ${newStatus}`);
  };

  // Handler: Create & Assign new order
  const handleSaveNewOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    if (newOrder.assignedDriverId) {
      // Update driver statistics and append history
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
      showToast(`Order ${newOrder.orderNumber} berhasil dibuat & ditugaskan ke ${newOrder.assignedDriverName}!`);
    } else {
      showToast(`Order ${newOrder.orderNumber} berhasil dibuat (Belum Ditugaskan).`);
    }
  };

  // Handler: Assign unassigned order to a driver
  const handleAssignOrderToDriver = (orderId: string, driverId: string) => {
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

    // Update order
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

    // Update driver
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

    showToast(`Order ${targetOrder.orderNumber} berhasil ditugaskan ke ${driver.name}!`);
  };

  const handleQuickAssignFromTable = (driver: Driver) => {
    setPreSelectedDriverForOrder(driver);
    setIsNewOrderOpen(true);
  };

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slide-up ring-2 ring-emerald-400/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
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
        
        {/* Peringatan & Notifikasi Dispatcher (Poin 6.7 & 6.8) */}
        <AlertBanner
          unassignedCount={unassignedOrders.length}
          readyDriverCount={readyDriversList.length}
          onOpenNewOrder={() => {
            setPreSelectedDriverForOrder(null);
            setIsNewOrderOpen(true);
          }}
          onScrollToTable={scrollToTable}
        />

        {/* Bagian Atas: Indikator KPI Utama (Poin 3 & Poin 7) */}
        <KPICards 
          kpi={kpiData} 
          onFilterStatus={(status) => setSelectedStatus(status)} 
        />

        {/* Bagian Tengah: Visualisasi Grafik & Leaderboard (Poin 2.5, 7, 6.9, 6.10) */}
        <ChartsSection
          drivers={branchFilteredDrivers}
          kpi={kpiData}
          onSelectDriverForHistory={(driver) => setSelectedDriverForHistory(driver)}
        />

        {/* Bagian Bawah: Tabel Monitoring Driver & Tugas (Poin 2.1, 5, 7) */}
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
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-400">Dashboard Monitoring Driver & Dispatcher Engine</span>
          </div>
          <div>
            Prinsip: Sederhana • Cepat Dibaca • Pengambilan Keputusan Efisien
          </div>
        </div>
      </footer>

      {/* Modals */}
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
