import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua order dari PostgreSQL
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        cargoTypeObj: true,
        branchObj: true,
        driver: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
            phone: true,
            vehicleType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = orders.map((o) => ({
      ...o,
      packageType: o.cargoTypeObj?.name || o.packageType,
      branch: o.branchObj?.name || o.branch,
      createdAt: new Date(o.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data order' },
      { status: 500 }
    );
  }
}

// POST: Buat order baru dan tugaskan ke driver
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      customer,
      pickupLocation,
      dropoffLocation,
      branch,
      status,
      assignedDriverId,
      assignedDriverName,
      targetDeliveryTime,
      packageType,
      priority,
      notes,
      branchId,
      cargoTypeId,
    } = body;

    // Resolve branchId if not provided
    let resolvedBranchId = branchId;
    if (!resolvedBranchId && branch) {
      const b = await prisma.branch.findFirst({
        where: {
          OR: [{ name: branch }, { code: branch }],
        },
      });
      if (b) resolvedBranchId = b.id;
    }

    // Resolve cargoTypeId if not provided
    let resolvedCargoTypeId = cargoTypeId;
    if (!resolvedCargoTypeId && packageType) {
      const c = await prisma.cargoType.findFirst({
        where: {
          OR: [{ name: packageType }, { code: packageType }],
        },
      });
      if (c) resolvedCargoTypeId = c.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Order di PostgreSQL
      const newOrder = await tx.order.create({
        data: {
          id: `ORD-${Date.now()}`,
          orderNumber,
          customer,
          pickupLocation,
          dropoffLocation,
          branch,
          status: status || (assignedDriverId ? 'Diterima' : 'Belum Ditugaskan'),
          assignedDriverId: assignedDriverId || null,
          assignedDriverName: assignedDriverName || null,
          targetDeliveryTime: targetDeliveryTime || 'Dalam 2 Jam',
          packageType: packageType || 'Paket Reguler',
          priority: priority || 'Normal',
          notes: notes || null,
          branchId: resolvedBranchId || null,
          cargoTypeId: resolvedCargoTypeId || null,
        },
      });

      // 2. Jika ada driver yang ditugaskan, perbarui driver & catat task history
      if (assignedDriverId) {
        const nowTime = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await tx.driver.update({
          where: { id: assignedDriverId },
          data: {
            status: 'Trip',
            totalTasks: { increment: 1 },
            inProgressTasks: { increment: 1 },
          },
        });

        await tx.taskHistory.create({
          data: {
            id: `TSK-${Date.now()}`,
            orderNumber,
            customer,
            pickupLocation,
            dropoffLocation,
            startTime: nowTime,
            endTime: '-',
            status: 'Berjalan',
            notes: notes || 'Ditugaskan langsung via Dispatcher Engine',
            driverId: assignedDriverId,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating order in PostgreSQL:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat order' },
      { status: 500 }
    );
  }
}

// PATCH: Tugaskan order yang belum memiliki driver ke driver standby
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, driverId } = body;

    if (!orderId || !driverId) {
      return NextResponse.json(
        { success: false, error: 'orderId dan driverId diperlukan' },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return NextResponse.json(
        { success: false, error: 'Driver tidak ditemukan' },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const targetOrder = await tx.order.findUnique({ where: { id: orderId } });
      if (!targetOrder) throw new Error('Order tidak ditemukan');

      const nowTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'Berjalan',
          assignedDriverId: driver.id,
          assignedDriverName: driver.name,
        },
      });

      // Update driver
      await tx.driver.update({
        where: { id: driver.id },
        data: {
          status: 'Trip',
          totalTasks: { increment: 1 },
          inProgressTasks: { increment: 1 },
        },
      });

      // Buat Task History
      await tx.taskHistory.create({
        data: {
          id: `TSK-${Date.now()}`,
          orderNumber: targetOrder.orderNumber,
          customer: targetOrder.customer,
          pickupLocation: targetOrder.pickupLocation,
          dropoffLocation: targetOrder.dropoffLocation,
          startTime: nowTime,
          endTime: '-',
          status: 'Berjalan',
          notes: targetOrder.notes || 'Penugasan cepat Dispatcher',
          driverId: driver.id,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error assigning order to driver:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menugaskan order ke driver' },
      { status: 500 }
    );
  }
}
