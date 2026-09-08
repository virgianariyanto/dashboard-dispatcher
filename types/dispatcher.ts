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
  nik?: string;
  name: string;
  avatarUrl: string;
  phone: string;
  simType: string;
  simTypeId?: string;
  branchId?: string;
  branchName?: string;
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
  status: OrderStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  driverPhone?: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  targetDeliveryTime: string;
  taskType: string;
  priority: 'Normal' | 'Tinggi' | 'Urgent';
  notes?: string;
  taskTypeId?: string;
  branchId?: string;
  branchName?: string;
}

export interface FilterState {
  search: string;
  status: string; // 'Semua' or specific DriverStatus
  timeFrame: TimeFrame;
}

export interface SimTypeItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  driverCount?: number;
}

export interface TaskTypeItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  orderCount?: number;
}

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isActive: boolean;
  driverCount?: number;
  orderCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
