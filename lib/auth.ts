import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface SafeUser {
  id: string;
  username: string;
  email: string | null;
  name: string;
  role: string;
  avatarUrl: string | null;
}

/**
 * Memastikan default admin tersedia di database PostgreSQL.
 * Jika belum ada, otomatis membuat akun admin default.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!existingAdmin) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await prisma.user.create({
        data: {
          username: defaultUsername,
          email: 'admin@dispatcher.com',
          password: hashedPassword,
          name: 'Super Administrator',
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
      console.log('✔ Default admin account initialized in PostgreSQL');
    }
  } catch (error) {
    console.error('Error ensuring default admin in PostgreSQL:', error);
  }
}

/**
 * Memverifikasi kredensial login (username/email + password).
 * Hanya mengizinkan role 'admin'.
 */
export async function verifyCredentials(
  usernameOrEmail: string,
  password: string
): Promise<SafeUser | null> {
  await ensureDefaultAdmin();

  const trimmedIdentifier = usernameOrEmail.trim();
  if (!trimmedIdentifier || !password) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: trimmedIdentifier },
        { email: trimmedIdentifier.toLowerCase() },
      ],
      role: 'admin',
    },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}
