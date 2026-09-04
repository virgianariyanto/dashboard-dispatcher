import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: { drivers: true, orders: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = branches.map((b) => ({
      ...b,
      driverCount: b._count.drivers,
      orderCount: b._count.orders,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data cabang' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, city, address, phone } = body;

    if (!code || !name || !city) {
      return NextResponse.json(
        { success: false, error: 'Kode, Nama Cabang, dan Kota wajib diisi' },
        { status: 400 }
      );
    }

    const created = await prisma.branch.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        city,
        address: address || null,
        phone: phone || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan cabang (Kode mungkin sudah terdaftar)' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, city, address, phone } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Cabang diperlukan' },
        { status: 400 }
      );
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        name,
        city,
        address,
        phone,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui cabang' },
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
      where: { branchId: id },
      data: { branchId: null },
    });

    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Cabang berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus cabang' },
      { status: 500 }
    );
  }
}
