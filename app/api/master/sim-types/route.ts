import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua data Master Jenis SIM beserta jumlah driver yang terhubung
export async function GET() {
  try {
    const simTypes = await prisma.simType.findMany({
      include: {
        _count: {
          select: { drivers: true },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    const formatted = simTypes.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      category: s.category,
      description: s.description,
      driverCount: s._count.drivers,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching sim types:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data master jenis SIM' },
      { status: 500 }
    );
  }
}

// POST: Tambah Jenis SIM baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, category, description } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Kode dan Nama Jenis SIM wajib diisi' },
        { status: 400 }
      );
    }

    const upperCode = code.trim().toUpperCase();

    // Check code unique
    const existing = await prisma.simType.findUnique({
      where: { code: upperCode },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Kode jenis SIM "${upperCode}" sudah terdaftar` },
        { status: 400 }
      );
    }

    const created = await prisma.simType.create({
      data: {
        code: upperCode,
        name: name.trim(),
        category: category || 'Kendaraan Ringan',
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating sim type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan jenis SIM' },
      { status: 500 }
    );
  }
}

// PUT / PATCH: Edit data Jenis SIM
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, category, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Jenis SIM diperlukan' },
        { status: 400 }
      );
    }

    const updated = await prisma.simType.update({
      where: { id },
      data: {
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(name ? { name: name.trim() } : {}),
        ...(category ? { category } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating sim type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui jenis SIM' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus data Jenis SIM
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

    // Unlink drivers with this simTypeId
    await prisma.driver.updateMany({
      where: { simTypeId: id },
      data: { simTypeId: null },
    });

    await prisma.simType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Jenis SIM berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting sim type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus jenis SIM' },
      { status: 500 }
    );
  }
}
