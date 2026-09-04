import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cargoTypes = await prisma.cargoType.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = cargoTypes.map((c) => ({
      ...c,
      orderCount: c._count.orders,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching cargo types:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data jenis muatan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, category, handlingInstruction, description } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Kode dan Nama Jenis Muatan wajib diisi' },
        { status: 400 }
      );
    }

    const created = await prisma.cargoType.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        category: category || 'Standard',
        handlingInstruction: handlingInstruction || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating cargo type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan jenis muatan baru (Kode mungkin sudah terdaftar)' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, category, handlingInstruction, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Jenis Muatan diperlukan' },
        { status: 400 }
      );
    }

    const updated = await prisma.cargoType.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        name,
        category,
        handlingInstruction,
        description,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating cargo type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data jenis muatan' },
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
        { success: false, error: 'ID Jenis Muatan diperlukan' },
        { status: 400 }
      );
    }

    // Proteksi: jangan hapus jika sedang digunakan oleh order
    const inUse = await prisma.order.count({
      where: { cargoTypeId: id },
    });

    if (inUse > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Jenis muatan ini tidak dapat dihapus karena sedang digunakan oleh ${inUse} order aktif.`,
        },
        { status: 400 }
      );
    }

    await prisma.cargoType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Jenis muatan berhasil dihapus dari database',
    });
  } catch (error) {
    console.error('Error deleting cargo type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus jenis muatan' },
      { status: 500 }
    );
  }
}
