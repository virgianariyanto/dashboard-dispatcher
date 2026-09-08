import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua order dari PostgreSQL
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        taskTypeObj: true,
        branchObj: true,
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            simType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = orders.map((o: any) => ({
      ...o,
      taskType: o.taskTypeObj?.name || o.taskType,
      branchName: o.branchObj?.name || null,
      branchCode: o.branchObj?.code || null,
      driverPhone: o.driver?.phone || null,
      startDate: o.startDate
        ? new Date(o.startDate).toISOString().split('T')[0]
        : new Date(o.createdAt).toISOString().split('T')[0],
      endDate: o.endDate
        ? new Date(o.endDate).toISOString().split('T')[0]
        : null,
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
      status,
      assignedDriverId,
      assignedDriverName,
      targetDeliveryTime,
      taskType: rawTaskType,
      packageType,
      priority,
      notes,
      startDate,
      endDate,
      taskTypeId: rawTaskTypeId,
      cargoTypeId,
      branchId,
    } = body;

    const taskType = rawTaskType || packageType || 'Replace';
    let resolvedTaskTypeId = rawTaskTypeId || cargoTypeId;
    if (!resolvedTaskTypeId && taskType) {
      const t = await prisma.taskType.findFirst({
        where: {
          OR: [{ name: taskType }, { code: taskType }],
        },
      });
      if (t) resolvedTaskTypeId = t.id;
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
          status: status || (assignedDriverId ? 'Diterima' : 'Belum Ditugaskan'),
          assignedDriverId: assignedDriverId || null,
          assignedDriverName: assignedDriverName || null,
          targetDeliveryTime: targetDeliveryTime || 'Dalam 2 Jam',
          taskType,
          priority: priority || 'Normal',
          notes: notes || null,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          taskTypeId: resolvedTaskTypeId || null,
          branchId: branchId || null,
        } as any,
        include: {
          taskTypeObj: true,
          branchObj: true,
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

    const formattedResult = {
      ...result,
      taskType: (result as any).taskTypeObj?.name || result.taskType,
      branchName: (result as any).branchObj?.name || null,
      startDate: (result as any).startDate
        ? new Date((result as any).startDate).toISOString().split('T')[0]
        : new Date(result.createdAt).toISOString().split('T')[0],
      endDate: (result as any).endDate
        ? new Date((result as any).endDate).toISOString().split('T')[0]
        : null,
      createdAt: new Date(result.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    return NextResponse.json({ success: true, data: formattedResult });
  } catch (error) {
    console.error('Error creating order in PostgreSQL:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat order' },
      { status: 500 }
    );
  }
}

// PATCH: Kelola status order (Assign, Complete, Cancel)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, driverId, action } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId diperlukan' },
        { status: 400 }
      );
    }

    const nowTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const result = await prisma.$transaction(async (tx) => {
      const targetOrder = await tx.order.findUnique({ where: { id: orderId } });
      if (!targetOrder) throw new Error('Order tidak ditemukan');

      // 1. AKSI: SELESAIKAN ORDER (COMPLETE)
      if (action === 'complete') {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'Selesai',
          },
        });

        if (targetOrder.assignedDriverId) {
          // Update riwayat tugas
          await tx.taskHistory.updateMany({
            where: {
              driverId: targetOrder.assignedDriverId,
              orderNumber: targetOrder.orderNumber,
              status: 'Berjalan',
            },
            data: {
              status: 'Selesai',
              endTime: nowTime,
            },
          });

          // Update metrics driver
          await tx.driver.update({
            where: { id: targetOrder.assignedDriverId },
            data: {
              completedTasks: { increment: 1 },
              inProgressTasks: { decrement: 1 },
            },
          });

          // Cek apakah driver masih ada order berjalan lainnya
          const otherActive = await tx.order.count({
            where: {
              assignedDriverId: targetOrder.assignedDriverId,
              status: 'Berjalan',
              id: { not: orderId },
            },
          });

          if (otherActive === 0) {
            const readyStatus = await tx.driverStatus.findFirst({
              where: { code: 'READY' },
            });

            await tx.driver.update({
              where: { id: targetOrder.assignedDriverId },
              data: {
                status: 'Ready',
                statusId: readyStatus?.id || undefined,
              },
            });
          }
        }

        return updatedOrder;
      }

      // 2. AKSI: BATALKAN ORDER (CANCEL)
      if (action === 'cancel') {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'Dibatalkan',
          },
        });

        if (targetOrder.assignedDriverId) {
          await tx.taskHistory.updateMany({
            where: {
              driverId: targetOrder.assignedDriverId,
              orderNumber: targetOrder.orderNumber,
              status: 'Berjalan',
            },
            data: {
              status: 'Cancel',
            },
          });

          await tx.driver.update({
            where: { id: targetOrder.assignedDriverId },
            data: {
              cancelledTasks: { increment: 1 },
              inProgressTasks: { decrement: 1 },
            },
          });

          const otherActive = await tx.order.count({
            where: {
              assignedDriverId: targetOrder.assignedDriverId,
              status: 'Berjalan',
              id: { not: orderId },
            },
          });

          if (otherActive === 0) {
            const readyStatus = await tx.driverStatus.findFirst({
              where: { code: 'READY' },
            });

            await tx.driver.update({
              where: { id: targetOrder.assignedDriverId },
              data: {
                status: 'Ready',
                statusId: readyStatus?.id || undefined,
              },
            });
          }
        }

        return updatedOrder;
      }

      // 3. AKSI: ASSIGN ORDER KE DRIVER
      if (!driverId) {
        throw new Error('driverId diperlukan untuk penugasan order');
      }

      const driver = await tx.driver.findUnique({ where: { id: driverId } });
      if (!driver) throw new Error('Driver tidak ditemukan');

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'Berjalan',
          assignedDriverId: driver.id,
          assignedDriverName: driver.name,
        },
      });

      // Update driver status ke Trip
      const tripStatus = await tx.driverStatus.findFirst({
        where: { code: 'TRIP' },
      });

      await tx.driver.update({
        where: { id: driver.id },
        data: {
          status: 'Trip',
          statusId: tripStatus?.id || undefined,
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
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui status order' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus order dari database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Order diperlukan' },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Order berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data order' },
      { status: 500 }
    );
  }
}
