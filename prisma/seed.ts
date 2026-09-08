import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MASTER_SIM_TYPES = [
  {
    code: 'SIM-A',
    name: 'SIM A',
    category: 'Mobil Penumpang & Barang Perseorangan',
    description: 'Untuk mengemudikan mobil penumpang dan barang perseorangan dengan jumlah berat tidak melebihi 3.500 kg',
  },
  {
    code: 'SIM-B1',
    name: 'SIM B1',
    category: 'Mobil Bus & Barang Perseorangan',
    description: 'Untuk mengemudikan mobil bus dan mobil barang perseorangan dengan jumlah berat lebih dari 3.500 kg',
  },
  {
    code: 'SIM-B2',
    name: 'SIM B2',
    category: 'Kendaraan Alat Berat & Gandengan',
    description: 'Untuk mengemudikan kendaraan alat berat, kendaraan penarik, atau gandengan lebih dari 1.000 kg',
  },
  {
    code: 'SIM-B1-UMUM',
    name: 'SIM B1 Umum',
    category: 'Mobil Bus & Angkutan Umum',
    description: 'Untuk mengemudikan mobil bus dan mobil barang untuk angkutan umum dengan jumlah berat lebih dari 3.500 kg',
  },
  {
    code: 'SIM-B2-UMUM',
    name: 'SIM B2 Umum',
    category: 'Kendaraan Penarik / Kontainer Umum',
    description: 'Untuk mengemudikan kendaraan penarik atau gandengan umum dengan berat lebih dari 1.000 kg',
  },
  {
    code: 'SIM-C',
    name: 'SIM C',
    category: 'Sepeda Motor (Roda 2)',
    description: 'Untuk mengemudikan sepeda motor roda dua dengan kapasitas silinder mesin hingga 250 cc',
  },
];

const MASTER_STATUSES = [
  { code: 'READY', name: 'Ready', color: 'emerald', isAvailable: true, description: 'Standby di hub dan siap menerima order tugas baru' },
  { code: 'TRIP', name: 'Trip', color: 'blue', isAvailable: false, description: 'Sedang dalam perjalanan menjalankan tugas delivery' },
  { code: 'WAITING', name: 'Menunggu Assignment', color: 'amber', isAvailable: true, description: 'Selesai tugas, sedang menunggu antrean order baru' },
  { code: 'LEAVE', name: 'Izin', color: 'rose', isAvailable: false, description: 'Izin sakit / ada keperluan mendesak' },
  { code: 'OFF', name: 'Off', color: 'slate', isAvailable: false, description: 'Jadwal libur rutin mingguan' },
];

const MASTER_TASK_TYPES = [
  {
    code: 'REPLACE',
    name: 'Replace',
    description: 'Tugas penggantian unit armada atau kendaraan yang mengalami kendala/perbaikan',
  },
  {
    code: 'SHORT_TERM',
    name: 'Short Term',
    description: 'Penugasan operasional armada jangka pendek',
  },
  {
    code: 'ANTAR_SHORT_TERM',
    name: 'Antar Short Term',
    description: 'Pengantaran unit armada jangka pendek ke lokasi pemesan/customer',
  },
  {
    code: 'TARIK_SHORT_TERM',
    name: 'Tarik Short Term',
    description: 'Penarikan kembali unit armada jangka pendek dari lokasi pemesan/customer',
  },
];

const MASTER_BRANCHES = [
  {
    code: 'CBG-JKT-01',
    name: 'Cabang Jakarta Pusat (Hub Thamrin)',
    city: 'Jakarta Pusat',
    address: 'Jl. M.H. Thamrin No. 28-30, Gondangdia, Menteng',
    phone: '021-3901234',
    email: 'hub.thamrin@dispatcher.id',
    managerName: 'Hendra Setiawan',
    isActive: true,
  },
  {
    code: 'CBG-JKT-02',
    name: 'Cabang Jakarta Selatan (Hub TB Simatupang)',
    city: 'Jakarta Selatan',
    address: 'Jl. TB Simatupang No. 15, Cilandak Barat',
    phone: '021-7590888',
    email: 'hub.simatupang@dispatcher.id',
    managerName: 'Rian Pratama',
    isActive: true,
  },
  {
    code: 'CBG-BDG-01',
    name: 'Cabang Bandung Utama (Hub Pasteur)',
    city: 'Bandung',
    address: 'Jl. Dr. Djunjunan No. 143-149, Pajajaran, Cicendo',
    phone: '022-2051234',
    email: 'hub.bandung@dispatcher.id',
    managerName: 'Budi Santoso',
    isActive: true,
  },
  {
    code: 'CBG-SBY-01',
    name: 'Cabang Surabaya Timur (Hub Rungkut)',
    city: 'Surabaya',
    address: 'Kawasan Industri Rungkut Blok B-12, Surabaya',
    phone: '031-8705678',
    email: 'hub.surabaya@dispatcher.id',
    managerName: 'Agus Triyono',
    isActive: true,
  },
  {
    code: 'CBG-SMG-01',
    name: 'Cabang Semarang (Hub Pemuda)',
    city: 'Semarang',
    address: 'Jl. Pemuda No. 88, Sekayu, Semarang Tengah',
    phone: '024-3549000',
    email: 'hub.semarang@dispatcher.id',
    managerName: 'Dewi Lestari',
    isActive: true,
  },
];

const SEED_ORDERS = [
  {
    id: 'ORD-1',
    orderNumber: 'ORD-20260904-037',
    customer: 'PT Surya Cipta Niaga',
    pickupLocation: 'Gedung Bursa Efek Indonesia, SCBD',
    dropoffLocation: 'Kota Kasablanka Mall, Lt 3',
    status: 'Belum Ditugaskan',
    targetDeliveryTime: '18:15',
    taskTypeCode: 'REPLACE',
    taskType: 'Replace',
    priority: 'Urgent',
    notes: 'Penggantian unit operasional armada customer di SCBD',
  },
  {
    id: 'ORD-2',
    orderNumber: 'ORD-20260904-038',
    customer: 'Restoran Bebek Tepi Sawah',
    pickupLocation: 'Cilandak Town Square',
    dropoffLocation: 'Pondok Labu Blok C2',
    status: 'Belum Ditugaskan',
    targetDeliveryTime: '18:00',
    taskTypeCode: 'SHORT_TERM',
    taskType: 'Short Term',
    priority: 'Tinggi',
    notes: 'Penugasan dinas armada jangka pendek di Cilandak',
  },
  {
    id: 'ORD-3',
    orderNumber: 'ORD-20260904-039',
    customer: 'Laboratorium Prodia Menteng',
    pickupLocation: 'Jl. Kramat Raya No. 150',
    dropoffLocation: 'RS Premier Jatinegara',
    status: 'Belum Ditugaskan',
    targetDeliveryTime: '17:45',
    taskTypeCode: 'ANTAR_SHORT_TERM',
    taskType: 'Antar Short Term',
    priority: 'Urgent',
    notes: 'Antar unit armada short term ke RS Premier',
  },
  {
    id: 'ORD-4',
    orderNumber: 'ORD-20260904-031',
    customer: 'PT Sentosa Abadi',
    pickupLocation: 'Hub Pusat',
    dropoffLocation: 'Karet Tengsin RT 05',
    status: 'Berjalan',
    assignedDriverId: 'DRV-001',
    assignedDriverName: 'Driver A',
    targetDeliveryTime: '17:15',
    taskTypeCode: 'TARIK_SHORT_TERM',
    taskType: 'Tarik Short Term',
    priority: 'Normal',
    notes: 'Penarikan unit armada selesai sewa short term',
  },
  {
    id: 'ORD-5',
    orderNumber: 'ORD-20260904-035',
    customer: 'Digital Solusi Nusantara',
    pickupLocation: 'Sudirman Central Plaza',
    dropoffLocation: 'Pacific Place Mall',
    status: 'Diterima',
    assignedDriverId: 'DRV-001',
    assignedDriverName: 'Driver A',
    targetDeliveryTime: '17:50',
    taskTypeCode: 'REPLACE',
    taskType: 'Replace',
    priority: 'Normal',
    notes: 'Replace unit di Sudirman Central Plaza',
  },
  {
    id: 'ORD-6',
    orderNumber: 'ORD-20260904-024',
    customer: 'Percetakan Grafika',
    pickupLocation: 'Kebon Jeruk Raya',
    dropoffLocation: 'Mall Taman Anggrek',
    status: 'Berjalan',
    assignedDriverId: 'DRV-003',
    assignedDriverName: 'Driver C',
    targetDeliveryTime: '16:45',
    taskTypeCode: 'ANTAR_SHORT_TERM',
    taskType: 'Antar Short Term',
    priority: 'Normal',
    notes: 'Antar unit armada short term ke Mall Taman Anggrek',
  },
];

const INITIAL_DRIVERS = [
  {
    id: 'DRV-001',
    name: 'Driver A',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7801',
    simTypeCode: 'SIM-C',
    simType: 'SIM C',
    statusCode: 'READY',
    status: 'Ready',
    startTime: '07:30',
    endTime: '16:30',
    notes: 'Standby di Hub Pusat, siap tugas pengiriman kilat',
    totalTasks: 8,
    completedTasks: 6,
    inProgressTasks: 1,
    pendingTasks: 1,
    cancelledTasks: 0,
    onTimeRate: 98,
    rating: 4.9,
    performanceScore: 95,
  },
  {
    id: 'DRV-002',
    name: 'Driver B',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7802',
    simTypeCode: 'SIM-A',
    simType: 'SIM A',
    statusCode: 'TRIP',
    status: 'Trip',
    startTime: '08:00',
    endTime: '17:00',
    notes: 'Sedang delivery rute Senopati - TB Simatupang',
    totalTasks: 7,
    completedTasks: 7,
    inProgressTasks: 0,
    pendingTasks: 0,
    cancelledTasks: 0,
    onTimeRate: 100,
    rating: 5.0,
    performanceScore: 98,
  },
  {
    id: 'DRV-003',
    name: 'Driver C',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7803',
    simTypeCode: 'SIM-C',
    simType: 'SIM C',
    statusCode: 'READY',
    status: 'Ready',
    startTime: '08:00',
    endTime: '17:00',
    notes: 'Area operasi Puri Indah, Kebon Jeruk, Tomang',
    totalTasks: 5,
    completedTasks: 3,
    inProgressTasks: 1,
    pendingTasks: 1,
    cancelledTasks: 0,
    onTimeRate: 94,
    rating: 4.8,
    performanceScore: 91,
  },
  {
    id: 'DRV-004',
    name: 'Driver D (Budi Santoso)',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7804',
    simTypeCode: 'SIM-B1',
    simType: 'SIM B1',
    statusCode: 'TRIP',
    status: 'Trip',
    startTime: '07:00',
    endTime: '16:00',
    notes: 'Pengiriman rute Rungkut Industri ke Tanjung Perak',
    totalTasks: 6,
    completedTasks: 4,
    inProgressTasks: 2,
    pendingTasks: 0,
    cancelledTasks: 0,
    onTimeRate: 96,
    rating: 4.85,
    performanceScore: 93,
  },
  {
    id: 'DRV-005',
    name: 'Driver E (Rian Hidayat)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7805',
    simTypeCode: 'SIM-C',
    simType: 'SIM C',
    statusCode: 'WAITING',
    status: 'Menunggu Assignment',
    startTime: '08:30',
    endTime: '17:30',
    notes: 'Selesai pengantaran terakhir, siap terima tugas baru',
    totalTasks: 4,
    completedTasks: 3,
    inProgressTasks: 0,
    pendingTasks: 0,
    cancelledTasks: 1,
    onTimeRate: 90,
    rating: 4.7,
    performanceScore: 88,
  },
  {
    id: 'DRV-006',
    name: 'Driver F (Agus Salim)',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7806',
    simTypeCode: 'SIM-C',
    simType: 'SIM C',
    statusCode: 'READY',
    status: 'Ready',
    startTime: '07:30',
    endTime: '16:30',
    notes: 'Standby Hub Medan Gatot Subroto',
    totalTasks: 5,
    completedTasks: 4,
    inProgressTasks: 0,
    pendingTasks: 1,
    cancelledTasks: 0,
    onTimeRate: 97,
    rating: 4.9,
    performanceScore: 94,
  },
  {
    id: 'DRV-007',
    name: 'Driver G (Hendra Kusuma)',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7807',
    simTypeCode: 'SIM-A',
    simType: 'SIM A',
    statusCode: 'LEAVE',
    status: 'Izin',
    startTime: '-',
    endTime: '-',
    notes: 'Izin surat dokter (Sakit flu & demam)',
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    cancelledTasks: 0,
    onTimeRate: 92,
    rating: 4.75,
    performanceScore: 85,
  },
  {
    id: 'DRV-008',
    name: 'Driver H (Dimas Pratama)',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7808',
    simTypeCode: 'SIM-C',
    simType: 'SIM C',
    statusCode: 'OFF',
    status: 'Off',
    startTime: '-',
    endTime: '-',
    notes: 'Jadwal Libur Rutin Mingguan',
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    cancelledTasks: 0,
    onTimeRate: 95,
    rating: 4.8,
    performanceScore: 89,
  },
];

async function main() {
  console.log('Seeding Master Data & Relational PostgreSQL...');

  // 1. Seed SIM Types
  const simTypeMap: Record<string, string> = {};
  for (const s of MASTER_SIM_TYPES) {
    const created = await prisma.simType.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    simTypeMap[s.name] = created.id;
    simTypeMap[s.code] = created.id;
  }

  // 2. Seed Driver Statuses
  const statusMap: Record<string, string> = {};
  for (const s of MASTER_STATUSES) {
    const created = await prisma.driverStatus.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
    statusMap[s.name] = created.id;
    statusMap[s.code] = created.id;
  }

  // 3. Seed Task Types (Only Replace, Short Term, Antar Short Term, Tarik Short Term)
  // Delete legacy task types
  await prisma.taskType.deleteMany({
    where: {
      code: { notIn: MASTER_TASK_TYPES.map((t) => t.code) },
    },
  });

  const taskTypeMap: Record<string, string> = {};
  for (const c of MASTER_TASK_TYPES) {
    const created = await prisma.taskType.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    taskTypeMap[c.name] = created.id;
    taskTypeMap[c.code] = created.id;
  }

  // 4. Seed Drivers with Relational IDs
  for (const drv of INITIAL_DRIVERS) {
    const statusId = statusMap[drv.statusCode] || statusMap[drv.status];
    const simTypeId = simTypeMap[drv.simTypeCode] || simTypeMap[drv.simType];
    const nik = (drv as { nik?: string }).nik || `317101${String(40 + Math.floor(Math.random() * 20))}059${drv.id.slice(-2)}0001`;

    await prisma.driver.upsert({
      where: { id: drv.id },
      update: {
        name: drv.name,
        nik,
        avatarUrl: drv.avatarUrl,
        phone: drv.phone,
        simType: drv.simType,
        status: drv.status,
        startTime: drv.startTime,
        endTime: drv.endTime,
        notes: drv.notes,
        totalTasks: drv.totalTasks,
        completedTasks: drv.completedTasks,
        inProgressTasks: drv.inProgressTasks,
        pendingTasks: drv.pendingTasks,
        cancelledTasks: drv.cancelledTasks,
        onTimeRate: drv.onTimeRate,
        rating: drv.rating,
        performanceScore: drv.performanceScore,
        statusId,
        simTypeId,
      },
      create: {
        id: drv.id,
        name: drv.name,
        nik,
        avatarUrl: drv.avatarUrl,
        phone: drv.phone,
        simType: drv.simType,
        status: drv.status,
        startTime: drv.startTime,
        endTime: drv.endTime,
        notes: drv.notes,
        totalTasks: drv.totalTasks,
        completedTasks: drv.completedTasks,
        inProgressTasks: drv.inProgressTasks,
        pendingTasks: drv.pendingTasks,
        cancelledTasks: drv.cancelledTasks,
        onTimeRate: drv.onTimeRate,
        rating: drv.rating,
        performanceScore: drv.performanceScore,
        statusId,
        simTypeId,
      },
    });
  }

  // 5. Seed Orders with Relational IDs (TaskType, Driver)
  for (const ord of SEED_ORDERS) {
    const taskTypeId = taskTypeMap[ord.taskTypeCode] || taskTypeMap[ord.taskType];

    await prisma.order.upsert({
      where: { id: ord.id },
      update: {
        orderNumber: ord.orderNumber,
        customer: ord.customer,
        pickupLocation: ord.pickupLocation,
        dropoffLocation: ord.dropoffLocation,
        status: ord.status,
        assignedDriverId: ord.assignedDriverId || null,
        assignedDriverName: ord.assignedDriverName || null,
        orderDate: new Date('2026-09-04T08:00:00Z'),
        targetDeliveryTime: ord.targetDeliveryTime,
        taskType: ord.taskType,
        priority: ord.priority,
        notes: ord.notes || null,
        taskTypeId,
      },
      create: {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customer: ord.customer,
        pickupLocation: ord.pickupLocation,
        dropoffLocation: ord.dropoffLocation,
        status: ord.status,
        assignedDriverId: ord.assignedDriverId || null,
        assignedDriverName: ord.assignedDriverName || null,
        orderDate: new Date('2026-09-04T08:00:00Z'),
        targetDeliveryTime: ord.targetDeliveryTime,
        taskType: ord.taskType,
        priority: ord.priority,
        notes: ord.notes || null,
        taskTypeId,
      },
    });
  }

  // Seed default admin
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@dispatcher.com',
      password: hashedPassword,
      name: 'Super Administrator',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 6. Seed Master Branches
  for (const b of MASTER_BRANCHES) {
    await prisma.branch.upsert({
      where: { code: b.code },
      update: {
        name: b.name,
        city: b.city,
        address: b.address,
        phone: b.phone,
        email: b.email,
        managerName: b.managerName,
        isActive: b.isActive,
      },
      create: {
        code: b.code,
        name: b.name,
        city: b.city,
        address: b.address,
        phone: b.phone,
        email: b.email,
        managerName: b.managerName,
        isActive: b.isActive,
      },
    });
  }

  console.log('✔ Master Data SIM Types, Branches, Drivers, Orders & Default Admin successfully seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
