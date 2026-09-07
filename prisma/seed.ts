import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


const MASTER_BRANCHES = [
  { code: 'JKT-PST', name: 'Jakarta Pusat', city: 'Jakarta', address: 'Jl. Sudirman No. 10', phone: '021-555101' },
  { code: 'JKT-SEL', name: 'Jakarta Selatan', city: 'Jakarta', address: 'Jl. TB Simatupang No. 45', phone: '021-555102' },
  { code: 'JKT-BRT', name: 'Jakarta Barat', city: 'Jakarta', address: 'Jl. Daan Mogot KM 12', phone: '021-555103' },
  { code: 'SBY-HUB', name: 'Surabaya', city: 'Surabaya', address: 'Kawasan Industri SIER No. 8', phone: '031-888201' },
  { code: 'BDG-HUB', name: 'Bandung', city: 'Bandung', address: 'Jl. Trunojoyo No. 24', phone: '022-777301' },
  { code: 'MDN-HUB', name: 'Medan', city: 'Medan', address: 'Jl. Gatot Subroto No. 88', phone: '061-666401' },
];

const MASTER_STATUSES = [
  { code: 'READY', name: 'Ready', color: 'emerald', isAvailable: true, description: 'Standby di hub dan siap menerima order tugas baru' },
  { code: 'TRIP', name: 'Trip', color: 'blue', isAvailable: false, description: 'Sedang dalam perjalanan menjalankan tugas delivery' },
  { code: 'WAITING', name: 'Menunggu Assignment', color: 'amber', isAvailable: true, description: 'Selesai tugas, sedang menunggu antrean order baru' },
  { code: 'LEAVE', name: 'Izin', color: 'rose', isAvailable: false, description: 'Izin sakit / ada keperluan mendesak' },
  { code: 'OFF', name: 'Off', color: 'slate', isAvailable: false, description: 'Jadwal libur rutin mingguan' },
];

const MASTER_VEHICLES = [
  { code: 'VARIO-160', name: 'Motor (Honda Vario 160)', category: 'Motor', maxWeightCapacity: 25, description: 'Kapasitas muatan hingga 25 kg, lincah untuk sameday' },
  { code: 'NMAX-155', name: 'Motor (Yamaha NMAX)', category: 'Motor', maxWeightCapacity: 30, description: 'Kapasitas muatan hingga 30 kg, bagasi luas' },
  { code: 'BEAT-110', name: 'Motor (Honda Beat)', category: 'Motor', maxWeightCapacity: 20, description: 'Ekonomis untuk dokumen & paket kecil' },
  { code: 'PCX-160', name: 'Motor (Honda PCX 160)', category: 'Motor', maxWeightCapacity: 30, description: 'Kenyamanan rute antarkota/jarak jauh' },
  { code: 'GRANMAX-VAN', name: 'Mobil Box (Gran Max Blind Van)', category: 'Mobil Box', maxWeightCapacity: 750, description: 'Volume kargo besar tahan hujan & cuaca' },
  { code: 'ISUZU-TRAGA', name: 'Mobil Box (Isuzu Traga)', category: 'Mobil Box', maxWeightCapacity: 1500, description: 'Kapasitas muat tonase besar untuk rute industri' },
  { code: 'CARRY-PICKUP', name: 'Pick-Up (Suzuki Carry)', category: 'Pick-Up', maxWeightCapacity: 1000, description: 'Bak terbuka untuk kargo fleksibel' },
];

const MASTER_CARGO_TYPES = [
  {
    code: 'REG',
    name: 'Paket Reguler (Kardus/Box)',
    category: 'Standard',
    handlingInstruction: 'Penanganan standar logistik, hindari ditumpuk berlebihan',
    description: 'Paket retail umum, pakaian, kardus ukuran kecil hingga medium',
  },
  {
    code: 'DOC',
    name: 'Dokumen & Surat Berharga',
    category: 'Dokumen',
    handlingInstruction: 'Wajib amplop kedap air, hindari terlipat dan basah',
    description: 'Kontrak legal, sertifikat, paspor, faktur, surat berharga',
  },
  {
    code: 'FRAGILE',
    name: 'Elektronik & Barang Pecah Belah',
    category: 'Sensitif',
    handlingInstruction: 'Jangan dibanting, posisikan tegak, wajib bubble wrap & packing kayu bila perlu',
    description: 'Hardware komputer, laptop, smartphone, kaca, keramik, peralatan lab',
  },
  {
    code: 'FOOD',
    name: 'Makanan & Minuman Segar',
    category: 'Makanan',
    handlingInstruction: 'Wajib thermal box / insulated bag, batas antar maksimal 2 jam',
    description: 'Makanan siap saji, bakery, frozen food, minuman dingin',
  },
  {
    code: 'HEAVY',
    name: 'Kargo Berat & Logistik Industri',
    category: 'Khusus',
    handlingInstruction: 'Wajib armada mobil box/pick-up, pengikatan tali kargo kuat',
    description: 'Mesin suku cadang, furnitur, material bangunan, drum/palet',
  },
  {
    code: 'MED',
    name: 'Farmasi & Sampel Medis',
    category: 'Sensitif',
    handlingInstruction: 'Suhu terkontrol steril, prioritas jalur ekspres tanpa jeda',
    description: 'Obat resep, vaksin, darah, reagen laboratorium klinis',
  },
];

const SEED_ORDERS = [
  {
    id: 'ORD-1',
    orderNumber: 'ORD-20260904-037',
    customer: 'PT Surya Cipta Niaga',
    pickupLocation: 'Gedung Bursa Efek Indonesia, SCBD',
    dropoffLocation: 'Kota Kasablanka Mall, Lt 3',
    branchCode: 'JKT-SEL',
    branch: 'Jakarta Selatan',
    status: 'Belum Ditugaskan',
    targetDeliveryTime: '18:15',
    cargoTypeCode: 'DOC',
    packageType: 'Dokumen & Surat Berharga',
    priority: 'Urgent',
    notes: 'Butuh driver standby secepatnya sebelum cut-off ekspres',
  },
  {
    id: 'ORD-2',
    orderNumber: 'ORD-20260904-038',
    customer: 'Restoran Bebek Tepi Sawah',
    pickupLocation: 'Cilandak Town Square',
    dropoffLocation: 'Pondok Labu Blok C2',
    branchCode: 'JKT-SEL',
    branch: 'Jakarta Selatan',
    status: 'Belum Ditugaskan',
    targetDeliveryTime: '18:00',
    cargoTypeCode: 'FOOD',
    packageType: 'Makanan & Minuman Segar',
    priority: 'Tinggi',
    notes: 'Harus dibawa menggunakan tas thermal box',
  },
  {
    id: 'ORD-3',
    orderNumber: 'ORD-20260904-039',
    customer: 'Laboratorium Prodia Menteng',
    pickupLocation: 'Jl. Kramat Raya No. 150',
    dropoffLocation: 'RS Premier Jatinegara',
    branchCode: 'JKT-PST',
    branch: 'Jakarta Pusat',
    status: 'Belum Ditugaskan',
    targetDeliveryTime: '17:45',
    cargoTypeCode: 'MED',
    packageType: 'Farmasi & Sampel Medis',
    priority: 'Urgent',
    notes: 'Prioritas utama: sampel medis mendesak',
  },
  {
    id: 'ORD-4',
    orderNumber: 'ORD-20260904-031',
    customer: 'PT Sentosa Abadi',
    pickupLocation: 'Hub Pusat',
    dropoffLocation: 'Karet Tengsin RT 05',
    branchCode: 'JKT-PST',
    branch: 'Jakarta Pusat',
    status: 'Berjalan',
    assignedDriverId: 'DRV-001',
    assignedDriverName: 'Driver A',
    targetDeliveryTime: '17:15',
    cargoTypeCode: 'REG',
    packageType: 'Paket Reguler (Kardus/Box)',
    priority: 'Normal',
  },
  {
    id: 'ORD-5',
    orderNumber: 'ORD-20260904-035',
    customer: 'Digital Solusi Nusantara',
    pickupLocation: 'Sudirman Central Plaza',
    dropoffLocation: 'Pacific Place Mall',
    branchCode: 'JKT-PST',
    branch: 'Jakarta Pusat',
    status: 'Diterima',
    assignedDriverId: 'DRV-001',
    assignedDriverName: 'Driver A',
    targetDeliveryTime: '17:50',
    cargoTypeCode: 'FRAGILE',
    packageType: 'Elektronik & Barang Pecah Belah',
    priority: 'Normal',
  },
  {
    id: 'ORD-6',
    orderNumber: 'ORD-20260904-024',
    customer: 'Percetakan Grafika',
    pickupLocation: 'Kebon Jeruk Raya',
    dropoffLocation: 'Mall Taman Anggrek',
    branchCode: 'JKT-BRT',
    branch: 'Jakarta Barat',
    status: 'Berjalan',
    assignedDriverId: 'DRV-003',
    assignedDriverName: 'Driver C',
    targetDeliveryTime: '16:45',
    cargoTypeCode: 'REG',
    packageType: 'Paket Reguler (Kardus/Box)',
    priority: 'Normal',
  },
];

const INITIAL_DRIVERS = [
  {
    id: 'DRV-001',
    name: 'Driver A',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '0812-3456-7801',
    vehicleTypeCode: 'VARIO-160',
    vehicleType: 'Motor (Honda Vario 160)',
    plateNumber: 'B 1245 KLA',
    branchCode: 'JKT-PST',
    branch: 'Jakarta Pusat',
    statusCode: 'READY',
    status: 'Ready',
    startTime: '07:30',
    endTime: '16:30',
    notes: 'Standby di Hub Pusat, siap tugas luar kota/ekspres',
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
    vehicleTypeCode: 'GRANMAX-VAN',
    vehicleType: 'Mobil Box (Gran Max Blind Van)',
    plateNumber: 'B 9871 TFR',
    branchCode: 'JKT-SEL',
    branch: 'Jakarta Selatan',
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
    vehicleTypeCode: 'NMAX-155',
    vehicleType: 'Motor (Yamaha NMAX)',
    plateNumber: 'B 3321 UHG',
    branchCode: 'JKT-BRT',
    branch: 'Jakarta Barat',
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
    vehicleTypeCode: 'ISUZU-TRAGA',
    vehicleType: 'Mobil Box (Isuzu Traga)',
    plateNumber: 'L 4412 ZX',
    branchCode: 'SBY-HUB',
    branch: 'Surabaya',
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
    vehicleTypeCode: 'PCX-160',
    vehicleType: 'Motor (Honda PCX 160)',
    plateNumber: 'D 2910 AAC',
    branchCode: 'BDG-HUB',
    branch: 'Bandung',
    statusCode: 'WAITING',
    status: 'Menunggu Assignment',
    startTime: '08:30',
    endTime: '17:30',
    notes: 'Selesai pengantaran terakhir, siap terima tugas baru di Hub Dago',
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
    vehicleTypeCode: 'BEAT-110',
    vehicleType: 'Motor (Honda Beat)',
    plateNumber: 'BK 5432 OP',
    branchCode: 'MDN-HUB',
    branch: 'Medan',
    statusCode: 'READY',
    status: 'Ready',
    startTime: '07:30',
    endTime: '16:30',
    notes: 'Standby Hub Gatot Subroto Medan',
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
    vehicleTypeCode: 'GRANMAX-VAN',
    vehicleType: 'Mobil Box (Daihatsu Gran Max)',
    plateNumber: 'B 9012 EWS',
    branchCode: 'JKT-PST',
    branch: 'Jakarta Pusat',
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
    vehicleTypeCode: 'VARIO-160',
    vehicleType: 'Motor (Honda Scoopy)',
    plateNumber: 'B 6172 PQW',
    branchCode: 'JKT-SEL',
    branch: 'Jakarta Selatan',
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

  // 1. Seed Branches
  const branchMap: Record<string, string> = {};
  for (const b of MASTER_BRANCHES) {
    const created = await prisma.branch.upsert({
      where: { code: b.code },
      update: b,
      create: b,
    });
    branchMap[b.name] = created.id;
    branchMap[b.code] = created.id;
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

  // 3. Seed Vehicle Types
  const vehicleMap: Record<string, string> = {};
  for (const v of MASTER_VEHICLES) {
    const created = await prisma.vehicleType.upsert({
      where: { code: v.code },
      update: v,
      create: v,
    });
    vehicleMap[v.name] = created.id;
    vehicleMap[v.code] = created.id;
  }

  // 4. Seed Cargo Types
  const cargoTypeMap: Record<string, string> = {};
  for (const c of MASTER_CARGO_TYPES) {
    const created = await prisma.cargoType.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    cargoTypeMap[c.name] = created.id;
    cargoTypeMap[c.code] = created.id;
  }

  // 5. Seed Drivers with Relational IDs
  for (const drv of INITIAL_DRIVERS) {
    const branchId = branchMap[drv.branchCode] || branchMap[drv.branch];
    const statusId = statusMap[drv.statusCode] || statusMap[drv.status];
    const vehicleTypeId = vehicleMap[drv.vehicleTypeCode] || vehicleMap[drv.vehicleType];

    await prisma.driver.upsert({
      where: { id: drv.id },
      update: {
        name: drv.name,
        avatarUrl: drv.avatarUrl,
        phone: drv.phone,
        vehicleType: drv.vehicleType,
        plateNumber: drv.plateNumber,
        branch: drv.branch,
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
        branchId,
        statusId,
        vehicleTypeId,
      },
      create: {
        id: drv.id,
        name: drv.name,
        avatarUrl: drv.avatarUrl,
        phone: drv.phone,
        vehicleType: drv.vehicleType,
        plateNumber: drv.plateNumber,
        branch: drv.branch,
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
        branchId,
        statusId,
        vehicleTypeId,
      },
    });
  }

  // 6. Seed Orders with Relational IDs (CargoType, Branch, Driver)
  for (const ord of SEED_ORDERS) {
    const branchId = branchMap[ord.branchCode] || branchMap[ord.branch];
    const cargoTypeId = cargoTypeMap[ord.cargoTypeCode] || cargoTypeMap[ord.packageType];

    await prisma.order.upsert({
      where: { id: ord.id },
      update: {
        orderNumber: ord.orderNumber,
        customer: ord.customer,
        pickupLocation: ord.pickupLocation,
        dropoffLocation: ord.dropoffLocation,
        branch: ord.branch,
        status: ord.status,
        assignedDriverId: ord.assignedDriverId || null,
        assignedDriverName: ord.assignedDriverName || null,
        targetDeliveryTime: ord.targetDeliveryTime,
        packageType: ord.packageType,
        priority: ord.priority,
        notes: ord.notes || null,
        branchId,
        cargoTypeId,
      },
      create: {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customer: ord.customer,
        pickupLocation: ord.pickupLocation,
        dropoffLocation: ord.dropoffLocation,
        branch: ord.branch,
        status: ord.status,
        assignedDriverId: ord.assignedDriverId || null,
        assignedDriverName: ord.assignedDriverName || null,
        targetDeliveryTime: ord.targetDeliveryTime,
        packageType: ord.packageType,
        priority: ord.priority,
        notes: ord.notes || null,
        branchId,
        cargoTypeId,
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

  console.log('✔ Master Data, Drivers, Orders & Default Admin successfully seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
