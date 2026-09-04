import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const statuses = await prisma.driverStatus.findMany({
      include: {
        _count: {
          select: { drivers: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = statuses.map((s) => ({
      ...s,
      driverCount: s._count.drivers,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching master status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, color, isAvailable, description } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Kode dan Nama Status wajib diisi' },
        { status: 400 }
      );
    }

    const created = await prisma.driverStatus.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        color: color || 'blue',
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating driver status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan status baru (Kode mungkin sudah terdaftar)' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, color, isAvailable, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Status diperlukan' },
        { status: 400 }
      );
    }

    const updated = await prisma.driverStatus.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        name,
        color,
        isAvailable,
        description,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating driver status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status' },
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

    // Unlink drivers with this status first
    await prisma.driver.updateMany({
      where: { statusId: id },
      data: { statusId: null },
    });

    await prisma.driverStatus.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Status berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting driver status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus status' },
      { status: 500 }
    );
  }
}
