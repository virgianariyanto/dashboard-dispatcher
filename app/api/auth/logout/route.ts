import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({
      success: true,
      message: 'Sesi telah ditutup. Logout berhasil.',
    });
  } catch (error) {
    console.error('Error handling logout:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menutup sesi.' },
      { status: 500 }
    );
  }
}
