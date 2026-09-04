export type DriverStatus = 
  | 'Ready'
  | 'Trip'
  | 'Menunggu Assignment'
  | 'Izin'
  | 'Off';

export type OrderStatus =
  | 'Belum Ditugaskan'
  | 'Diterima'
  | 'Berjalan'
  | 'Selesai'
  | 'Dibatalkan';

export type TimeFrame = 'harian' | 'mingguan' | 'bulanan';

export interface TaskHistoryItem {
  id: string;
  orderNumber: string;
  customer: string;
  pickupLocation: string;
  dropoffLocation: string;
  startTime: string;
  endTime: string;
  status: 'Selesai' | 'Berjalan' | 'Pending' | 'Cancel';
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  branch: string;
  status: DriverStatus;
  startTime: string;
  endTime: string;
  notes: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  cancelledTasks: number;
  onTimeRate: number; // percentage, e.g., 96
  rating: number; // e.g., 4.9
  performanceScore: number; // 0-100
  taskHistory: TaskHistoryItem[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  pickupLocation: string;
  dropoffLocation: string;
  branch: string;
  status: OrderStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  createdAt: string;
  targetDeliveryTime: string;
  packageType: string;
  priority: 'Normal' | 'Tinggi' | 'Urgent';
  notes?: string;
  branchId?: string;
  cargoTypeId?: string;
}

export interface FilterState {
  search: string;
  status: string; // 'Semua' or specific DriverStatus
  branch: string; // 'Semua Cabang' or specific branch
  timeFrame: TimeFrame;
}

export interface KPIData {
  totalDrivers: number;
  readyDrivers: number;
  tripDrivers: number;
  offOrLeaveDrivers: number;
  waitingAssignmentDrivers: number;
  totalOrders: number;
  ordersReceived: number;
  ordersInProgress: number;
  ordersCompleted: number;
  ordersUnassigned: number;
  ordersCancelled: number;
  targetOrders: number;
  realizationRate: number;
}
