import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vehicles = await prisma.vehicleType.findMany({
      include: {
        _count: {
          select: { drivers: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = vehicles.map((v) => ({
      ...v,
      driverCount: v._count.drivers,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching vehicle types:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data jenis kendaraan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, category, maxWeightCapacity, description } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Kode dan Nama Kendaraan wajib diisi' },
        { status: 400 }
      );
    }

    const created = await prisma.vehicleType.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        category: category || 'Motor',
        maxWeightCapacity: maxWeightCapacity ? parseFloat(maxWeightCapacity) : 0,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating vehicle type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan jenis kendaraan baru (Kode mungkin sudah terdaftar)' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, category, maxWeightCapacity, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Jenis Kendaraan diperlukan' },
        { status: 400 }
      );
    }

    const updated = await prisma.vehicleType.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        name,
        category,
        maxWeightCapacity: maxWeightCapacity !== undefined ? parseFloat(maxWeightCapacity) : undefined,
        description,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating vehicle type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui jenis kendaraan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter id diperlukan' },
        { status: 400 }
      );
    }

    await prisma.driver.updateMany({
      where: { vehicleTypeId: id },
      data: { vehicleTypeId: null },
    });

    await prisma.vehicleType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Jenis kendaraan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting vehicle type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus jenis kendaraan' },
      { status: 500 }
    );
  }
}
