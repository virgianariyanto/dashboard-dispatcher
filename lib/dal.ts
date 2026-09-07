import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { decrypt, SessionPayload } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const verifySession = cache(async (): Promise<{ isAuth: boolean; session: SessionPayload | null }> => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const session = await decrypt(sessionToken);

  if (!session?.userId || session.role !== 'admin') {
    return { isAuth: false, session: null };
  }

  return { isAuth: true, session };
});

export const getCurrentAdmin = cache(async () => {
  const { isAuth, session } = await verifySession();
  if (!isAuth || !session?.userId) {
    return null;
  }

  try {
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return admin;
  } catch (error) {
    console.error('Failed to fetch admin user:', error);
    return null;
  }
});
