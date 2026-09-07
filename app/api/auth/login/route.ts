import { NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await verifyCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kredensial login tidak valid. Pastikan username dan password benar.' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya Administrator yang diizinkan.' },
        { status: 403 }
      );
    }

    // Buat session cookie terenkripsi
    await createSession(user);

    return NextResponse.json({
      success: true,
      message: 'Login berhasil! Selamat datang kembali.',
      data: user,
    });
  } catch (error) {
    console.error('Error handling login:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat proses login.' },
      { status: 500 }
    );
  }
}
