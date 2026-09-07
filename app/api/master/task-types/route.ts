import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const taskTypes = await prisma.taskType.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = taskTypes.map((t) => ({
      ...t,
      orderCount: t._count.orders,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching task types:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data jenis tugas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, description } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Kode dan Nama Jenis Tugas wajib diisi' },
        { status: 400 }
      );
    }

    const created = await prisma.taskType.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating task type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan jenis tugas baru (Kode mungkin sudah terdaftar)' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Jenis Tugas diperlukan' },
        { status: 400 }
      );
    }

    const updated = await prisma.taskType.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        name,
        description,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating task type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data jenis tugas' },
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
        { success: false, error: 'ID Jenis Tugas diperlukan' },
        { status: 400 }
      );
    }

    // Proteksi: jangan hapus jika sedang digunakan oleh order
    const inUse = await prisma.order.count({
      where: { taskTypeId: id },
    });

    if (inUse > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Jenis tugas ini tidak dapat dihapus karena sedang digunakan oleh ${inUse} order aktif.`,
        },
        { status: 400 }
      );
    }

    await prisma.taskType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Jenis tugas berhasil dihapus dari database',
    });
  } catch (error) {
    console.error('Error deleting task type:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus jenis tugas' },
      { status: 500 }
    );
  }
}
