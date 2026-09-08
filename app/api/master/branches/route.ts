import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        _count: {
          select: {
            drivers: true,
            orders: true,
          },
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
      { success: false, error: 'Gagal mengambil data master cabang' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, city, address, phone, email, managerName, isActive } = body;

    if (!code || !name || !city) {
      return NextResponse.json(
        { success: false, error: 'Kode Cabang, Nama Cabang, dan Kota wajib diisi' },
        { status: 400 }
      );
    }

    const trimmedCode = code.toUpperCase().trim();

    const existing = await prisma.branch.findUnique({
      where: { code: trimmedCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Kode cabang "${trimmedCode}" sudah digunakan.` },
        { status: 400 }
      );
    }

    const created = await prisma.branch.create({
      data: {
        code: trimmedCode,
        name: name.trim(),
        city: city.trim(),
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        managerName: managerName ? managerName.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan cabang baru' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, code, name, city, address, phone, email, managerName, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Cabang diperlukan' },
        { status: 400 }
      );
    }

    if (!code || !name || !city) {
      return NextResponse.json(
        { success: false, error: 'Kode Cabang, Nama Cabang, dan Kota tidak boleh kosong' },
        { status: 400 }
      );
    }

    const trimmedCode = code.toUpperCase().trim();

    // Check duplicate code on another branch
    const duplicate = await prisma.branch.findFirst({
      where: {
        code: trimmedCode,
        NOT: { id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: `Kode cabang "${trimmedCode}" sudah digunakan oleh cabang lain.` },
        { status: 400 }
      );
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        code: trimmedCode,
        name: name.trim(),
        city: city.trim(),
        address: address !== undefined ? (address ? address.trim() : null) : undefined,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        managerName: managerName !== undefined ? (managerName ? managerName.trim() : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data cabang' },
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
        { success: false, error: 'Parameter id cabang diperlukan' },
        { status: 400 }
      );
    }

    // Check relation with drivers & orders
    const driverCount = await prisma.driver.count({
      where: { branchId: id },
    });

    const orderCount = await prisma.order.count({
      where: { branchId: id },
    });

    if (driverCount > 0 || orderCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cabang tidak dapat dihapus karena terhubung dengan ${driverCount} driver dan ${orderCount} order aktif.`,
        },
        { status: 400 }
      );
    }

    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Data cabang berhasil dihapus dari sistem',
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus cabang' },
      { status: 500 }
    );
  }
}
