import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua data driver beserta riwayat tugas dari PostgreSQL
export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        simTypeObj: true,
        driverStatusObj: true,
        branchObj: true,
        taskHistories: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formatted = drivers.map((d) => ({
      ...d,
      simType: d.simTypeObj?.name || d.simType,
      branchName: d.branchObj?.name || null,
      branchCode: d.branchObj?.code || null,
      taskHistory: d.taskHistories,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching drivers from PostgreSQL:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data driver' },
      { status: 500 }
    );
  }
}

// POST: Tambah driver baru ke PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      nik,
      phone,
      simType,
      status,
      startTime,
      endTime,
      notes,
      branchId,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nama driver wajib diisi' },
        { status: 400 }
      );
    }

    // Auto generate driver ID jika tidak diberikan
    const count = await prisma.driver.count();
    const generatedId = body.id || `DRV-${String(count + 1).padStart(3, '0')}`;

    // Avatar default acak
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    ];
    const avatarUrl = body.avatarUrl || defaultAvatars[count % defaultAvatars.length];

    // Resolve relational IDs
    let resolvedStatusId = body.statusId;
    if (!resolvedStatusId && status) {
      const st = await prisma.driverStatus.findFirst({
        where: { OR: [{ name: status }, { code: status }] },
      });
      if (st) resolvedStatusId = st.id;
    }

    let resolvedSimTypeId = body.simTypeId;
    if (!resolvedSimTypeId && simType) {
      const sim = await prisma.simType.findFirst({
        where: { OR: [{ name: simType }, { code: simType }] },
      });
      if (sim) resolvedSimTypeId = sim.id;
    }

    const newDriver = await prisma.driver.create({
      data: {
        id: generatedId,
        nik: nik ? String(nik).trim() : null,
        name,
        avatarUrl,
        phone: phone || '-',
        simType: simType || 'SIM A',
        status: status || 'Ready',
        startTime: startTime || '08:00',
        endTime: endTime || '17:00',
        notes: notes || '',
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        cancelledTasks: 0,
        onTimeRate: 100.0,
        rating: 5.0,
        performanceScore: 90,
        statusId: resolvedStatusId || null,
        simTypeId: resolvedSimTypeId || null,
        branchId: branchId || null,
      },
      include: {
        taskHistories: true,
        simTypeObj: true,
        branchObj: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newDriver,
        simType: newDriver.simTypeObj?.name || newDriver.simType,
        branchName: newDriver.branchObj?.name || null,
        branchCode: newDriver.branchObj?.code || null,
        taskHistory: [],
      },
    });
  } catch (error) {
    console.error('Error creating driver in PostgreSQL:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan driver' },
      { status: 500 }
    );
  }
}

// PUT: Perbarui seluruh profil driver
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      nik,
      phone,
      simType,
      status,
      startTime,
      endTime,
      notes,
      branchId,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Driver diperlukan' },
        { status: 400 }
      );
    }

    // Resolve relational IDs
    let resolvedStatusId = body.statusId;
    if (!resolvedStatusId && status) {
      const st = await prisma.driverStatus.findFirst({
        where: { OR: [{ name: status }, { code: status }] },
      });
      if (st) resolvedStatusId = st.id;
    }

    let resolvedSimTypeId = body.simTypeId;
    if (!resolvedSimTypeId && simType) {
      const sim = await prisma.simType.findFirst({
        where: { OR: [{ name: simType }, { code: simType }] },
      });
      if (sim) resolvedSimTypeId = sim.id;
    }

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        name,
        phone,
        ...(nik !== undefined ? { nik: nik ? String(nik).trim() : null } : {}),
        simType: simType || 'SIM A',
        status,
        startTime,
        endTime,
        notes,
        ...(resolvedStatusId ? { statusId: resolvedStatusId } : {}),
        ...(resolvedSimTypeId ? { simTypeId: resolvedSimTypeId } : {}),
        ...(branchId !== undefined ? { branchId: branchId || null } : {}),
      },
      include: {
        taskHistories: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        simTypeObj: true,
        branchObj: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        simType: updated.simTypeObj?.name || updated.simType,
        branchName: updated.branchObj?.name || null,
        branchCode: updated.branchObj?.code || null,
        taskHistory: updated.taskHistories,
      },
    });
  } catch (error) {
    console.error('Error updating driver in PostgreSQL:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui profil driver' },
      { status: 500 }
    );
  }
}

// PATCH: Update status ketersediaan driver
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { driverId, status, notes } = body;

    if (!driverId || !status) {
      return NextResponse.json(
        { success: false, error: 'driverId dan status diperlukan' },
        { status: 400 }
      );
    }

    // Resolve statusId
    let resolvedStatusId = body.statusId;
    if (!resolvedStatusId && status) {
      const st = await prisma.driverStatus.findFirst({
        where: { OR: [{ name: status }, { code: status }] },
      });
      if (st) resolvedStatusId = st.id;
    }

    // Jika driver diubah statusnya menjadi 'Izin' atau 'Off', alihkan order yang sedang berjalan kembali ke antrean unassigned
    if (status === 'Izin' || status === 'Off') {
      await prisma.order.updateMany({
        where: {
          assignedDriverId: driverId,
          status: { in: ['Berjalan', 'Diterima'] },
        },
        data: {
          status: 'Belum Ditugaskan',
          assignedDriverId: null,
          assignedDriverName: null,
        },
      });
    }

    const updated = await prisma.driver.update({
      where: { id: driverId },
      data: {
        status,
        ...(resolvedStatusId ? { statusId: resolvedStatusId } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        taskHistories: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        simTypeObj: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        simType: updated.simTypeObj?.name || updated.simType,
        taskHistory: updated.taskHistories,
      },
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status driver' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus driver dari PostgreSQL
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('id');

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: 'Parameter id diperlukan' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Unassign orders assigned to this driver
      await tx.order.updateMany({
        where: { assignedDriverId: driverId },
        data: {
          assignedDriverId: null,
          assignedDriverName: null,
          status: 'Belum Ditugaskan',
        },
      });

      // 2. Delete task histories
      await tx.taskHistory.deleteMany({
        where: { driverId },
      });

      // 3. Delete driver
      await tx.driver.delete({
        where: { id: driverId },
      });
    });

    return NextResponse.json({ success: true, message: 'Driver berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting driver from PostgreSQL:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus driver' },
      { status: 500 }
    );
  }
}
